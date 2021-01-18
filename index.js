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

    const emotePrefix = '-';

    if (message.content.startsWith(emotePrefix)) {
        getMessageEmotes(message)
            .then(content => {
                if (message.content.slice(1) === content) return;

                let webhook_content = content.replace(/\`/g,'');
                replaceMessageEmotes(message, webhook_content);
            });
    }

    async function getMessageEmotes(message) {
        // return early if author is bot
        if (message.author.bot) return message.content.slice(1);
        
        // return early if length of split message contents is less than 3, since a pair of backticks makes it length >= 3
        let content = message.content.toLowerCase().slice(1).split(/\`/);
        if (content.length < 3) return message.content.slice(1);

        // get the emotes from each guild
        let emoteCache = [];
        let guilds = await message.client.guilds.cache;
        guilds.forEach(guild => {
            emoteCache.push(guild.emojis.cache)
        });

        // try to match the emote name to every emote in each guild
        const alphanum = /^[a-z0-9\_]+$/i;

        content = await Promise.all(content.map(async substring => {
            // return backticks for the empty substrings
            if (substring === '') return '\`';

            // return substring if not alphanumeric
            if (substring.match(alphanum) === null) return substring;

            let emotePicker = [];
            for (let emotes of emoteCache) {
                emotes.forEach(emote => {
                    if (substring === emote.name.toLowerCase()) emotePicker.push(emote);
                });
            }

            // return the original substring if no matches were found
            if (emotePicker.length === 0) return substring;
            
            // return the first emote as a string if one match was found
            if (emotePicker.length === 1) {
                let emote = emotePicker.map(emote => {
                    return (emote.animated) ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`;
                });
                return emote.join('');
            };

            // return the first emote as a string if multiple matches were found (TEMPORARY)
            if (emotePicker.length > 1) {
                emote = await selectMessageEmote(message, emotePicker);
                return emote;
            };
        })).then((results) => {
            return results.join('');
        })
        
        return content;

    }

    async function replaceMessageEmotes(message, content) {
        message.delete();

        const webhooks = await message.channel.fetchWebhooks();
        const webhook = webhooks.first();

        let member = message.guild.member(message.author);
        let nickname = member ? member.displayName : null;
        let avatar = message.author.displayAvatarURL();

        if (typeof(webhook) === 'undefined') {                
            // no webhook exists in this channel, so create one
            message.channel.createWebhook('CinnaBot')
                .then(webhook => {
                    webhook.send(content, {
                        username: nickname,
                        avatarURL: avatar,
                    });
                });
        } else {
            // send the content through the existing channel webhook
            webhook.send(content, {
                username: nickname,
                avatarURL: avatar,
            });
        }
    }

    async function selectMessageEmote(message, emoteDuplicate) {
        let emoteIndex = emoteDuplicate.map((emote, index) => index);
        let emoteInfo = emoteDuplicate.map((emote, index) => {
            return (emote.animated) ? `${index}: <a:${emote.name}:${emote.id}> ${emote.guild.name}` : `${index}: <:${emote.name}:${emote.id}> ${emote.guild.name}`
        })
        emoteInfo = emoteInfo.join('\n');

        const filter = (msg) => (msg.author.id === message.author.id && emoteIndex.includes(parseInt(msg.content)));

        const reply = await message.reply(`${emoteDuplicate.length} emotes were found with the name ${emoteDuplicate[0].name}.\n`+
            `Please select the number of the emote you want to use for the replacement. This command will automatically time out in 10 seconds.\n`+
            `${emoteInfo}`);
        const pickedEmote = await message.channel.awaitMessages(filter, {max: 1, maxProcessed: 2, time: 10000, errors: ['time']})
                .then(collected => {
                    if (collected.size === 0) {
                        reply.edit(`Error received. Defaulting to first emote.`)
                        let emote = emoteDuplicate[0];
                        return (emote.animated) ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`;
                    } else {
                        let emote = collected.map(collect => {
                            let emotes = emoteDuplicate.filter((emote, index) => index === (parseInt(collect.content)));
                            return emotes[0];
                        });
                        emote = emote[0];
                        return (emote.animated) ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>` 
                    }
                })
                .catch(() => {
                    reply.edit(`Error received. Defaulting to first emote.`)
                    let emote = emoteDuplicate[0];
                    return (emote.animated) ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`;
                })
        return pickedEmote;

    }
});

///// LOG CLIENT INTO DISCORD
client.login(process.env.CLIENT_TOKEN);