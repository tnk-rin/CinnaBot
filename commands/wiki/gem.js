const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const { Cinnabar } = require('@internal/geminfo');

module.exports = class gemInfo extends Command {
    constructor(client) {
        super(client, {
            name: 'gem',
            group: 'wiki',
            memberName: 'geminfo',
            description: 'Sends the information for the noted gem',
            args: [
                {
                    key: 'gemName',
                    prompt: 'Which gem would you to see?',
                    type: 'string'
                },
            ],
        });
    }

    async run(message, {gemName}) {
        const embed = new MessageEmbed()
            .setColor('#bd081d')
            .setTitle('Cinnabar / シンシャ')
            .setDescription('Hardness two. Due to the idiosyncratic nature of the inexhaustible release of venom from the body, '+
                'he is in charge of patrolling the night when the moon does not appear, keeping a distance from other jewels. Intelligent and thoughtful.')
            .setThumbnail('http://land-of-the-lustrous.com/core_sys/images/main/top/top_img.png')
            .addFields(
                {name: 'Hardness', value: '2.0', inline: true},
                {name: 'Mineral', value: 'Sulfide', inline: true},
                {name: 'Chemistry', value: 'HgS', inline: true},
                {name: 'Color', value: 'Red, brownish-red'},
                {name: 'Job', value: 'Night Watcher'},
            )
            .setImage('http://land-of-the-lustrous.com/core_sys/images/contents/00000005/base/001.png?1534933411')
            .setFooter('http://land-of-the-lustrous.com/chara/cinnabar.html')


        message.reply(`${Cinnabar.Alias[1]}`)
        message.channel.send(embed)
    }
    
};