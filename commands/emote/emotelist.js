// emotelist.js

///// imports
const { Command } = require('discord.js-commando');

///// functions
function sortEmotes(emotes) {
    let sorted = emotes.sort((a, b) => {
        let nameA = a.name.toLowerCase();
        let nameB = b.name.toLowerCase();
        return (nameA < nameB) ? -1 : 1;
    });
    return sorted;
}

function getEmoteFormat(emote) {
    return (emote.animated) ? `<a:`+emote.name+`:`+emote.id+`>` : `<:`+emote.name+`:`+emote.id+`>`
}
    
function setEmoteArray(emotes) {
    // split emote array into line groups of 5 columns
    let array1 = [];
    for (let [column, value] of emotes.entries()) {
        if (column % 5 === 0) {
            array1.push([value]);
        } else {
            array1[array1.length-1].push(value);
        }
    }
    array1 = array1.map(emote => emote.join(''));

    // split emote array further into message groups of 5 rows
    let array2 = [];
    for (let [row, value] of array1.entries()) {
        if (row % 5 === 0) {
            array2.push([value]);
        } else {
            array2[array2.length-1].push(value);
        }
    }
    return array2;
}

///// exports
module.exports = class gemInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'emotelist',
            group: 'emote',
            memberName: 'emotelist',
            description: 'Sends the list of emotes for the messaged server.',
            format: '!emotelist',
            guildOnly: true,
            examples: ['!emotelist']
        });
    }

    async run(message) {
        // return early if author is bot
        if (message.author.bot) return;

        // check if the OP has mod-like permissions in the current server
        const member = message.guild.member(message.author);
        const memberPerms = member.permissions.toArray();
        const flags = ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'MANAGE_ROLES'];
        const modCheck = memberPerms.some(perm => flags.some(flag => flag === perm));
        if (!modCheck) return message.reply('only Sensei can use me like that.');

        // get guilds from client
        const guilds = message.client.guilds.cache;

        // send the emotes list for the messaged server
        guilds.forEach(guild => {
            if (guild.id !== message.guild.id) return;

            // first, sort the list of static and animated emotes
            let emoteStatic = sortEmotes(guild.emojis.cache.filter(emote => !emote.animated));
            let emoteAnimated = sortEmotes(guild.emojis.cache.filter(emote => emote.animated));

            // second, convert each emote element into its formatted form
            emoteStatic = emoteStatic.map(emote => getEmoteFormat(emote));
            emoteAnimated = emoteAnimated.map(emote => getEmoteFormat(emote));
            
            // third, format the array into a message
            let textStatic = setEmoteArray(emoteStatic);
            let textAnimated = setEmoteArray(emoteAnimated);

            // fourth & finally, delete the message command & send the new message to the channel
            message.delete()
                .then(message.say(`\*\*List of static emotes \(${emoteStatic.length}\/100\):\*\*`))
                .then(textStatic.forEach(text => message.say(text)))
                .then(message.say(`\*\*List of animated emotes \(${emoteAnimated.length}\/100\):\*\*`))
                .then(textAnimated.forEach(text => message.say(text)))
        });
    }
};