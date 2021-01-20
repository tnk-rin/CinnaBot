// message.js

///// functions
async function sendMessageWebhook(message, content) {
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
module.exports = async (client, message) => {
    // return early if author is bot
    if (message.author.bot) return;

    // Emote replace block
    // Attempt to replace emotes in a message by a non-nitro user by checking the contents of a substring enclosed by a pair of colons, e.g. :emote:
    // To prevent nitro users from using this command, replacement will not be attempted if there is at least one escape character or backtick in the message
    // Emote names are also case-sensitive, so users must type in the emote as written in the server!
    if (message.content.split(/\:/).length > 2 && message.content.split(/\`/).length <= 1 && message.content.split(/\\/).length <= 1) {
        const emoteRegex = /<a?:\w+:\d+>|(?<!\\):(\w+):/g;
        let newMessage = message.content.replace(emoteRegex, replaceMessageEmotes);
        // return if there were no changes to the message
        if (message.content === newMessage) return;
        await sendMessageWebhook(message, newMessage);
    }






    ///// functions
    function replaceMessageEmotes(substring, match) {
        // Returns a string after attempting to replace the emote substrings of the original message
        if (match) {
            let emoteMatch = getMatchEmojis(substring, match);
            if (emoteMatch) {
                return (emoteMatch.animated) ? `<a:${emoteMatch.name}:${emoteMatch.id}>` : `<:${emoteMatch.name}:${emoteMatch.id}>`;
            }
        }
        // if no emote matches were found, return the original substring
        return substring;
    }
    
    function getMatchEmojis(substring, match) {
        // name matches are case-sensitive to prevent nitro users from using this command
        let name = emote => emote.name === match;
        // prioritize the first emote found in the messaged server, otherwise get the first match in other servers
        let emoteMatch = message.guild.emojis.cache.find(name);
        if (!emoteMatch) {
            emoteMatch = client.guilds.cache.flatMap(guild => guild.emojis.cache).find(name);
        }
        return emoteMatch;
    }
};