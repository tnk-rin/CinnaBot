///// INTIALIZATION /////
// required modules
const fs = require('fs');
const { config } = require('dotenv');
const { CommandoClient } = require('discord.js-commando');
config({path: `${__dirname}/process.env`});

// Commando client
const client = new CommandoClient({
    commandPrefix: process.env.PREFIX,
    owner: process.env.OWNER,
    invite: process.env.INVITE,
    homeguild: process.env.HOMEGUILD,
    disableEveryone: true
});



///// read client event files
fs.readdir('./events/', (error, files) => {
    if (error) return console.log(error);
    files.forEach(file => {
        let event = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
    });
});


///// LOG CLIENT INTO DISCORD
client.login(process.env.CLIENT_TOKEN);
