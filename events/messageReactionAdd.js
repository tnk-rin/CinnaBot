// messageReactionAdd.js

//// imports
const { reactionroles } = require("../config.json");

//// exports
module.exports = async (client, reaction) => {
    // ignore reactions from itself
    if (reaction.me) return;

    // reaction role add/remove
    // if the valid emote is used on a message, get the role it corresponds to
    let roleID = getRoleID();
    if (roleID) {
        let role = reaction.message.guild.roles.cache.get(roleID);
        let user = reaction.message.guild.members.cache.get(reaction.users.cache.first().id);
        let hasRole = user.roles.cache.get(role.id);
        if (hasRole) {
            user.roles.remove(role).catch(console.error)
        } else {
            user.roles.add(role).catch(console.error)
        }
        // remove the reaction
        const otherUsers = reaction.users.cache.filter(user => user.id !== reaction.message.author.id);
        const otherReactions = reaction.message.reactions.cache.filter(reaction => !reaction.users.cache.has(reaction.message.author.id));
        try {
            for (let reaction of otherReactions.values()) {
                for (let user of otherUsers.values()) {
                    await reaction.users.remove(user.id);
                }
            }
        } catch (error) {
            console.error("Failed to remove reactions.");
        }
    } else {
        // remove invalid reactions from the role picker messages
        for (let guildID in reactionroles) {
            if (reaction.message.guild.id !== guildID) continue;
            for (let channelID in reactionroles[guildID]) {
                if (reaction.message.channel.id !== channelID) continue;
                let channel = await client.channels.cache.get(channelID);
                for (let messageID in reactionroles[guildID][channelID]) {
                    if (reaction.message.id !== messageID) continue;
                    let message = await channel.messages.fetch(messageID);
                    for (let emoteID in reactionroles[guildID][channelID][messageID]) {
                        if (reaction._emoji.id !== emoteID) return message.reactions.cache.get(reaction._emoji.id).remove().catch(error => console.error('Failed to remove reactions: ', error));
                    }
                }
            }
        }
    }

    

    
    //// functions
    function getRoleID() {
        // check if the message ID matches any valid message ID for reaction roles
        // if matched, check if the emote is also correct and return the role
        for (let guildID in reactionroles) {
            for (let channelID in reactionroles[guildID]) {
                for (let messageID in reactionroles[guildID][channelID]) {
                    if (reaction.message.id === messageID) {
                        for (let emoteID in reactionroles[guildID][channelID][messageID]) {
                            if (reaction._emoji.id === emoteID) return reactionroles[guildID][channelID][messageID][emoteID];
                        }
                    }
                }
            }
        }
    }
};