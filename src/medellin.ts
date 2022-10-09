import {
  SmartContract,
  isReady,
  Poseidon,
  Field,
  Experimental,
  Permissions,
  State,
  state,
  CircuitValue,
  PublicKey,
  UInt64,
  prop,
  Mina,
  method,
  UInt32,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';
import { MerkleTree } from 'snarkyjs/dist/node/lib/merkle_tree';

export { Account, MerkleWitness, deploy, tryEnroll };

await isReady;

const doProofs = false;

class MerkleWitness extends Experimental.MerkleWitness(8) { }

// these are off-chain in-memory storage
type Names = 'Azuki' | 'BoredApe' | 'CoolCat' | 'Doodle';

class Account extends CircuitValue {
  @prop publicKey: PublicKey;
  // Some addresses can have higher weight in raffle if they finish more optional requirement
  @prop weight: UInt32;

  constructor(publicKey: PublicKey, weight: UInt32) {
    super(publicKey, weight);
    this.publicKey = publicKey;
    this.weight = weight;
  }

  hash(): Field {
    return Poseidon.hash(this.toFields());
  }
}

// // we need the initiate tree root in order to tell the contract about our off-chain storage
// let initialCommitment: Field = Field.zero;

export class Medellin extends SmartContract {
  // store the status of the current raffle 
  @state(Field) start = State<Boolean>();
  // a commitment is a cryptographic primitive that allows us to commit to data, with the ability to "reveal" it later
  @state(Field) commitment = State<Field>();
  // The minimum balance required to join the raffle
  @state(Field) minimumBalance = State<Field>();

  init(minimumBalance: Field, initialBalance: number, initialCommitment: Field) {
    this.start.set(Boolean(true));
    this.minimumBalance.set(minimumBalance);
    this.balance.addInPlace(UInt64.fromNumber(initialBalance));
    this.start.set(Boolean(true));
    this.commitment.set(initialCommitment);
  }

  @method enroll(account: Account, path: MerkleWitness) {
    // check if the raffle is still on
    this.start.assertEquals(Boolean(true));

    // check the user meets the minimum balance
    let minimumBalance = this.minimumBalance.get();
    this.minimumBalance.assertEquals(minimumBalance);
    Mina.getBalance(account.publicKey).assertGt(new UInt64(minimumBalance));

    // check Twitter and Discord eligibility 

    // we fetch the on-chain commitment
    let commitment = this.commitment.get();
    this.commitment.assertEquals(commitment);

    // we calculate the new Merkle Root, based on the account changes
    let newCommitment = path.calculateRoot(account.hash());
    this.commitment.set(newCommitment);
  }
}

async function deploy(
  zkAppInstance: Medellin,
  zkappKey: PrivateKey,
  minimumBalance: Field,
  initialBalance: number,
  initialCommitment: Field,
  feePayer: PrivateKey
) {
  // await Medellin.compile();
  let tx = await Mina.transaction(feePayer, () => {
    AccountUpdate.fundNewAccount(feePayer, { initialBalance });
    zkAppInstance.deploy({ zkappKey });
    zkAppInstance.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
    zkAppInstance.init(minimumBalance, initialBalance, initialCommitment);
  });
  await tx.send().wait();
}

async function tryEnroll(name: Names, index: bigint, Accounts: Map<string, Account>, Tree: MerkleTree, medellinZkApp: Medellin, feePayer: PrivateKey, zkappKey: PrivateKey, enrolledAccounts: Array<Field>) {
  let account = Accounts.get(name)!;
  let w = Tree.getWitness(index);
  let witness = new MerkleWitness(w);

  let tx = await Mina.transaction(feePayer, () => {
    medellinZkApp.enroll(account, witness);
    if (!doProofs) medellinZkApp.sign(zkappKey);
  });
  if (doProofs) {
    await tx.prove();
  }
  await tx.send();

  // if the transaction was successful, we can update our off-chain storage as well
  enrolledAccounts.push(account.hash())
  Tree.setLeaf(index, account.hash());
  medellinZkApp.commitment.get().assertEquals(Tree.getRoot());
}