///// INTIALIZATION /////
// required modules
const fs = require('fs');
const { config } = require('dotenv');
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
config({path: `${__dirname}/process.env`});

// Commando client
const client = new CommandoClient({
    commandPrefix: process.env.PREFIX,
    owner: process.env.OWNER,
    invite: process.env.INVITE,
    homeguild: process.env.HOMEGUILD,
    disableEveryone: true
});

// register client commands
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

// client ready & status
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('OVER THE MOON.', {type: 'WATCHING'})
        .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
        .catch(console.error);
});

///// CLIENT ON EVENTS /////
// client error event
client.on('error', console.error);


// client read messages
client.on('message', message => {
    
    // const webhooks = message.guild.fetchWebhooks();
    // console.log(webhooks);

    const emote_prefix = '-';

    if (message.content.startsWith(emote_prefix)) {   
        replaceMessageEmote(message);
    }

    function replaceMessageEmote(message) {
        // return early if author is bot or no animated emote exists in the server
        const emotes_animated = message.guild.emojis.cache.filter(emote => emote.animated);
        if (message.author.bot || emotes_animated.size === 0) return;

        /*
        message contents will be split at backticks, preserving the backticks as empty '' strings if they start and end the message
        contents will be checked if and only they contain alphanumeric (underscore included)
        if a replacement is made, the backticks are deleted and the string will be joined from the array with NO spacing
        */
        const contentOld = message.content.toLowerCase().slice(1).split(/\`+/);
        
        // perform checks for each substring in the message, if alphanumeric
        const contentNew = contentOld.map(content => {
            let alphanum = /^[0-9a-zA-z\s]+$/;
                if (!content.match(alphanum)) return;
                for (let emote of emotes_animated.values()) {
                    if (content === emote.name.toLowerCase()) {
                        return `<a:`+emote.name+`:`+emote.id+`>`;
                    }
                }
                // if no matches were found, return the same content value
                return content
        });
        console.log(contentNew.join(''));

        // replace message if there were any changes made to message contents
        if (contentNew.join('') !== contentOld.join('')) {
            message.delete();
            message.channel.send(contentNew.join(' '));
        }
    }
});

///// LOG CLIENT INTO DISCORD
client.login(process.env.CLIENT_TOKEN);