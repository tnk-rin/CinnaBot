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
        const old_contents = message.content.toLowerCase().slice(1).split(/ +/);
        const new_contents = [...old_contents];
        const emotes_animated = message.guild.emojis.cache.filter(emote => emote.animated);

        // tries to replace message if author is not a bot and at least one animated emote exists in server
        if (!message.author.bot && emotes_animated.size != 0) {
            // perform checks for each substring in the message
            for (let [key, content] of new_contents.entries()) {
                // compare the substring to each animated emote
                for (let emote of emotes_animated.values()) {
                    if (content === emote.name.toLowerCase()) {
                        // if matched, replace the message contents with the emote formatting
                        // and break out of loop to stop comparing to the emotes
                        new_contents[key] = `<a:`+emote.name+`:`+emote.id+`>`;
                        break
                    }
                }
            }

            // only replaces message if the new message content is different
            if (old_contents != new_contents) {
                message.delete();
                message.say(new_contents.join(' '));
            }
        }
    }
});


///// LOG CLIENT INTO DISCORD
client.login(process.env.CLIENT_TOKEN);