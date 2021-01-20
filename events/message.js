// message.js

///// functions
async function checkMessageEmotes(message) {
    // Returns an array of emote substrings from the message that are eligible for replacement
    /*  1) Match any message substrings in the form :name:, <:name:id> or <a:name:id>
        2) If the substring starts with < and ends with >, then it is already in emote form
        3) Else, it is eligible to replaced
    */

    const emoteRegex = /<a?:\w+:\d+>|(?<!\\):(\w+):/g;
    const canReplace = message.content.match(emoteRegex).filter(substring => !(substring.startsWith('\<') && substring.endsWith('\>')));

    return canReplace;
}

async function replaceMessageEmotes(message, canReplace) {
    // Returns a string after attempting to replace the substrings of the original message

    // get the emote caches from each guild
    let emoteCache = [];
    const guilds = await message.client.guilds.cache;
    guilds.forEach(guild => {
        emoteCache.push(guild.emojis.cache)
    });

    let content = message.content;
    // attempt to match & replace a substring for each canReplace substring
    canReplace.forEach(substring => {
        content = content.replace(substring, (inputName) => {
            // get the name from the input by removing colons
            const name = inputName.replace(/\:/g,'');
            
            // get the array of matching emotes
            let emoteMatched = []
            for (let emotes of emoteCache) {
                emotes.forEach(emote => {
                    if (name.toLowerCase() === emote.name.toLowerCase()) emoteMatched.push(emote);
                });
            }
            
            // return the original substring if no matches were found
            if (emoteMatched.length === 0) return substring;

            // if multiple matches are found, prioritize using the emote in the messaged server
            // otherwise, default to the first emote
            if (emoteMatched.length >= 1) {
                let emote = [];
                if (emoteMatched.some(emote => emote.guild.id === message.guild.id)) {
                    let emotes = emoteMatched.filter(emote => emote.guild.id === message.guild.id);
                    emote = emotes[0];
                } else {
                    emote = emoteMatched[0];
                }     
                return (emote.animated) ? `<a:${emote.name}:${emote.id}>` : `<:${emote.name}:${emote.id}>`
            };

        });
    });
    return content;
}

async function sendMessageEmotes(message, content) {
    // Deletes the OP's message and sends a webhook mimicking the OP
    message.delete();
    const webhooks = await message.channel.fetchWebhooks();
    const webhook = webhooks.first();

    // get user info from the message
    const member = message.guild.member(message.author);
    const nickname = member ? member.displayName : null;
    const avatar = message.author.displayAvatarURL();

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

///// exports
module.exports = (client, message) => {
    // return early if author is bot
    if (message.author.bot) return;

    // emote replace block
    /* Purpose: replace emotes in a message by a non-nitro user by checking the contents of a substring enclosed by a pair of colons, e.g. :emote:
        An emote is eligible for replacement if it includes two colons,
        as the array formed by splitting the message by colons will have a length greater than 2 if there are at least two colins in the message
    */
    if (message.content.split(/\:/).length > 2) {
        checkMessageEmotes(message)
            .then(canReplace => {
                // return if no eligible emotes were found
                if (canReplace.length === 0) return;
                return replaceMessageEmotes(message, canReplace)
            .then(newMessage => {
                // return if there were no changes
                if (message.content === newMessage) return;
                sendMessageEmotes(message, newMessage);
                    })
            })
    } 
}