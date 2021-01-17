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
        replaceMessageEmotes(message).then(async webhook_content => {
            if (message.content.slice(1) === webhook_content) return;
            
            message.delete();
            // send webhook with message
            const webhooks = await message.channel.fetchWebhooks();
            const webhook = webhooks.first();

            let member = message.guild.member(message.author);
            let nickname = member ? member.displayName : null;
            let avatar = message.author.displayAvatarURL();

            if (typeof(webhook) === 'undefined') {                
                // no webhook exists in this channel, so create one
                message.channel.createWebhook('CinnaBot')
                    .then(webhook => {
                        webhook.send(webhook_content, {
                            username: nickname,
                            avatarURL: avatar,
                        });
                    });
            } else {
                // send the content through the existing channel webhook
                webhook.send(webhook_content, {
                    username: nickname,
                    avatarURL: avatar,
                });
            }
        });
    }

    async function replaceMessageEmotes(message) {
        // return early if author is bot or no animated emote exists in the server
        const emotes_animated = await message.guild.emojis.cache.filter(emote => emote.animated);
        if (message.author.bot || emotes_animated.size === 0) return message.content.slice(1);

        // return early if length < 3, which requires at least one pair of backticks in the message
        contentOld = message.content.toLowerCase().slice(1).split(/\`/)
        if (contentOld.length < 3) return message.content.slice(1);

        // perform checks for each substring in the message, if alphanumeric
        const alphanum = /^[0-9a-zA-z\s\<\>\:]+$/;
        const contentNew = contentOld.map(content => {
                if (!content.match(alphanum)) return;
                for (let emote of emotes_animated.values()) {
                    if (content === emote.name.toLowerCase()) {
                        return `<a:`+emote.name+`:`+emote.id+`>`;
                    }
                }
                // if no matches were found, return the same content value
                return content
        });
        
        return contentNew.join('');
    }
});

///// LOG CLIENT INTO DISCORD
client.login(process.env.CLIENT_TOKEN);