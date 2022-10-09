import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const checkmark = require("./images/checkmark.png");
const twitter = require("./images/twitter.png");
const discord = require("./images/discord.png");
const wallet = require("./images/wallet.jpeg");

const boxStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '25px',
  boxShadow: 24,
  p: 4,
};

const Home = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <div className="title">Medellín</div>
      <div className="subtitle">The fair, privacy-preserving raffle tool for the people</div>
      <div className='body'>
        <div className='project-info'>
          <div className="project-title">Medellín x Azuki NFT Giveaway</div>
          <div className='project-metadata'>
            <div>NUMBER OF WINNERS: 10 winners</div>
            <div>MINT DATE: Nov 11, 2022</div>
            <div>MINT PRICE: 0.1 MINA</div>
          </div>
          <div className='project-body'>
            Existing raffle toolings such as Premint are used by multiple NFT projects nowadays to distribute allowlists, however they expose several problems.
            <br /><br />
            Privacy concern. The association among the Twitter account, Discord account and wallet are exposed to the platform as well as a lot of projects.
            <br /><br />
            Biased selection. The projects tend to select the users who have higher number of followers on Twitter, or who have more Ethereum in wallets as the raffle winners, as these people tend to bring more benefits to the project than ordinary users.
            <br /><br />
            To solve the privacy and fairness issues, we are using Mina to build a privacy-preserving and fair raffle tooling for all of the web3 projects who have the demand to do whitelist raffling.
          </div>
        </div>

        <div className="enrollment">
          <div className='enrollment-title'>Requirements</div>
          <Box className='enrollment-box'>
            <List>
              <ListItem disablePadding className='enrollment-item'>
                <ListItemButton>
                  <ListItemIcon>
                    <img className='logo-img' src={twitter} alt="Twitter" />
                  </ListItemIcon>
                  <ListItemText primary="Follow Medellín on Twitter" />
                  <ListItemIcon className='enrollment-status-icon'>
                    <img className='status-img' src={checkmark} alt="Completed" />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <img className='logo-img' src={discord} alt="Discord" />
                  </ListItemIcon>
                  <ListItemText primary="Join Medellín Discord" />
                  <ListItemIcon className='enrollment-status-icon'>
                    <img className='status-img' src={checkmark} alt="Completed" />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <img className='logo-img' src={wallet} alt="Wallet" />
                  </ListItemIcon>
                  <ListItemText primary="Wallet Balance > 0.1 MINA" />
                  <ListItemIcon className='enrollment-status-icon'>
                    <img className='status-img' src={checkmark} alt="Completed" />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            </List>
          </Box>

          <Button className="register-button" variant="contained" color="success" onClick={handleOpen}>
            REGISTER
          </Button>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={boxStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Congratulations!
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                You have successfully enrolled in the raffle.
              </Typography>
            </Box>
          </Modal>
        </div>

      </div>
    </div >
  )
}

export default React.memo(Home)