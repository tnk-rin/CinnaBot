// guildMemberAdd.js

//// imports
const { MessageEmbed, Message } = require("discord.js");

//// exports
module.exports = async (client, member) => {
    // welcome messages are enabled for Rin's Solo Camp server only!
    if (member.guild.id === "725009170839109682") {
        // log the join event to #welcome-logs
        const modlog = await client.channels.cache.get("725030145840382053");
        modlog.send(`${member.user.username} has joined! <:RinHi:725291274013376553>`)

        // do not send embed message if the user is a bot!
        if (member.user.bot) return;

        // create embed
        const embedMessage = new MessageEmbed()
            .setColor("#059ecd")
            .setTitle(member.guild.name)
            .setThumbnail(member.user.avatarURL())
            .setDescription(
                `Welcome, <@!${member.user.id}>!\n`+
                "Rin is love, Rin is life.\n\n"+
                "Check out the rules in <#779044446104059914> to gain access to the server."
            )
            .setImage("https://raw.githubusercontent.com/Kazumik0108/CinnaBot/main/images/welcome/RinWave1.gif")

        // send the embed message to #simp-central
        const channel = await client.channels.cache.get("725009172357316698");
        channel.send(embedMessage)
    }
}