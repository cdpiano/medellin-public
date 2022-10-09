import { Account, Medellin, deploy, tryEnroll } from "./medellin";
import {
  isReady,
  shutdown,
  Field,
  Experimental,
  PublicKey,
  Mina,
  UInt32,
  PrivateKey,
} from 'snarkyjs';


describe('Add smart contract integration test', () => {
  let feePayer: PrivateKey,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppInstance: Medellin;

  const initialBalance = 10_000_000_000;
  const minimumBalance = Field(1);
  const doProofs = false;
  const Tree = new Experimental.MerkleTree(8);
  let enrolledAccounts: Array<Field> = new Array();
  // these are off-chain in-memory storage
  type Names = 'Azuki' | 'BoredApe' | 'CoolCat' | 'Doodle';
  let Accounts: Map<string, Account> = new Map<Names, Account>();
  // we need the initiate tree root in order to tell the contract about our off-chain storage
  let initialCommitment: Field = Field.zero;

  beforeEach(async () => {
    await isReady;
    let Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    feePayer = Local.testAccounts[0].privateKey
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkAppInstance = new Medellin(zkAppAddress);

    // We set weight as 1 for everyone for simplicity
    let azuki = new Account(Local.testAccounts[0].publicKey, UInt32.from(1));
    let boredape = new Account(Local.testAccounts[1].publicKey, UInt32.from(1));
    let coolcat = new Account(Local.testAccounts[2].publicKey, UInt32.from(1));
    let doodle = new Account(Local.testAccounts[3].publicKey, UInt32.from(1));

    // we now need "wrap" the Merkle tree around our off-chain storage
    // we initialize a new Merkle Tree with height 8
    Tree.setLeaf(BigInt(0), azuki.hash());
    Tree.setLeaf(BigInt(1), boredape.hash());
    Tree.setLeaf(BigInt(2), coolcat.hash());
    Tree.setLeaf(BigInt(3), doodle.hash());

    Accounts.set('Azuki', azuki);
    Accounts.set('BoredApe', boredape);
    Accounts.set('CoolCat', coolcat);
    Accounts.set('Doodle', doodle);

    // now that we got our accounts set up, we need the commitment to deploy our contract!
    initialCommitment = Tree.getRoot();

    console.log('Deploying Medellin..');
    // if (doProofs) {
    //   await Medellin.compile();
    // }
    return;
  });


  afterEach(async () => {
    setTimeout(shutdown, 0);
  });

  it('Test contract can be deployed', async () => {
    await deploy(zkAppInstance, zkAppPrivateKey, minimumBalance, initialBalance, initialCommitment, feePayer)
  });

  it('Azuki should be able to enroll', async () => {
    await deploy(zkAppInstance, zkAppPrivateKey, minimumBalance, initialBalance, initialCommitment, feePayer)
    await tryEnroll('Azuki', BigInt(0), Accounts, Tree, zkAppInstance, feePayer, zkAppPrivateKey, enrolledAccounts);
    expect(enrolledAccounts.length).toEqual(1);
  });

  it('BoredApe should not be able to enroll', async () => {
    await deploy(zkAppInstance, zkAppPrivateKey, minimumBalance, initialBalance, initialCommitment, feePayer)
    await tryEnroll('Azuki', BigInt(0), Accounts, Tree, zkAppInstance, feePayer, zkAppPrivateKey, enrolledAccounts);
    expect(enrolledAccounts.length).toEqual(1);

    await tryEnroll('BoredApe', BigInt(1), Accounts, Tree, zkAppInstance, feePayer, zkAppPrivateKey, enrolledAccounts);
    expect(enrolledAccounts.length).toEqual(1);
  });
});