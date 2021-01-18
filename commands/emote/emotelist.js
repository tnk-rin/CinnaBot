// call in required modules
// call in config file
const { config } = require('dotenv');
config({
    path: `${__dirname}/process.env`
})
const { Command } = require('discord.js-commando');

module.exports = class gemInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'emotelist',
            group: 'emote',
            memberName: 'emotelist',
            description: 'Sends the list of emotes of a server',
            format: '!emotelist',
        });
    }

    async run(message) {
        const admins = ['210188048195911680'];
        // return early if a non-admin tries to use this command
        if (!admins.includes(message.author.id)) return message.reply('you do not have permission to use this command.');

        // get guilds and guild names from client
        const guilds = await message.client.guilds.cache.values();

        // arrow function sorts the list of emotes by name
        let sorted = (emotes) => emotes.sort((a, b) => {
            let nameA = a.name.toLowerCase();
            let nameB = b.name.toLowerCase();
            return (nameA < nameB) ? -1 : 1;
        });

        // arrow function returns the formatted emote
        let format = (emote) => {
            return (emote.animated) ? `<a:`+emote.name+`:`+emote.id+`>` : `<:`+emote.name+`:`+emote.id+`>`
        }

        for (let guild of guilds) {
            // currently, this function only works for server emotes
            if (guild.id !== message.guild.id) continue;

            // first, sort the list of static and animated emotes
            let emoteStatic = sorted(guild.emojis.cache.filter(emote => !emote.animated));
            let emoteAnimated = sorted(guild.emojis.cache.filter(emote => emote.animated));

            // second, convert each emote element into its formatted form
            emoteStatic = emoteStatic.map(emote => format(emote));
            emoteAnimated = emoteAnimated.map(emote => format(emote));
            
            // third, format the array into a message
            let textStatic = setEmoteArray(emoteStatic);
            let textAnimated = setEmoteArray(emoteAnimated);

            // fourth & finally, delete the message command & send the new message to the channel
            message.delete()
                .then(`\*\*List of static emotes \(${emoteStatic.length}\/100\):\*\*`)
                .then(textStatic.map(text => message.say(text)))
                .then(message.say(`\*\*List of animated emotes \(${emoteAnimated.length}\/100\):\*\*`))
                .then(textAnimated.map(text => message.say(text)))

            // leave to loop to prevent the bot from checking other guilds
            break
        }
            
        function setEmoteArray(emotes) {
            // split emote array into groups of 5 columns
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
    }
};