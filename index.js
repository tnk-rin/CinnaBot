// call in required modules
const fs = require('fs');
const { config } = require('dotenv');
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
// const { token } = require('./config.json')

// create a new Commando client
const client = new CommandoClient({
    commandPrefix: process.env.PREFIX,
    owner: process.env.OWNER,
    invite: process.env.INVITE,
    disableEveryone: true
});



// set up client commands
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['emote', 'Emote and Reaction Commands'],
        ['wiki', 'Gem Wiki Information'],
        ['test', 'Test Commands'],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

// client ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('OVER THE MOON.', {type: 'WATCHING'})
        .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
        .catch(console.error);
});

// client error event
client.on('error', console.error);

// call to the config file location
config({
    path: `${__dirname}/process.env`
})

// login to Discord with CinnaBot's token
client.login(process.env.CLIENT_TOKEN);