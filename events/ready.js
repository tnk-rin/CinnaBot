// ready.js

///// imports
const { config } = require("dotenv");
config({path: `${__dirname}/process.env`});
const { access } = require("fs");
const path = require("path");
const Twit = require("twit");
const { reactionroles, twitterstreams } = require("../config.json");

///// constants
const statuses = [
    {"WATCHING": ["over the moon", "the ocean", "over the winter", "a useless gem", "the jellyfish", "the Lunarians"]},
    {"LISTENING": ["the fireflies", "the silence", "Sensei", "the waves by the shore"]}
];

const TwitterBot = new Twit({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_KEY_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

///// functions
function startUpMessages(client) {
    console.log(`\nLogged in as ${client.user.tag}! (${client.user.id})\n`);
    console.log(`List of guilds for this application:`);
    client.guilds.cache.forEach(guild => {
        console.log(`\t${guild.name} \| ${guild.id}`);
    });
}


///// exports
module.exports = async (client) => {
    // startup & status messages
    startUpMessages(client);
    setStatus()
        .then(setInterval(setStatus, 10 * 60 * 1000))
    
    // register commands into client
    client.registry
        .registerDefaultTypes()
        .registerGroups([
            ["server", "Server Function Commands"],
            ["emote", "Emote and Reaction Commands"],
            ["wiki", "Gem Wiki Information"],
        ])
        .registerDefaultGroups()
        .registerDefaultCommands()
        .registerCommandsIn(path.join(__dirname,`../`,`/commands`));

    // reaction roles: put messages into cache from each guild
    for (let guildID in reactionroles) {
        for (let channelID in reactionroles[guildID]) {
            let channel = await client.channels.cache.get(channelID);
            for (let messageID in reactionroles[guildID][channelID]) {
                channel.messages.fetch(messageID, true, false)
                    .then(message => console.log(`Added message id ${message.id} to the cache from server ${message.guild.name} in channel ${message.channel.name}.`))
                    .catch(console.error)
            }
        }
    }

    // create the various twitter streams to post content their specified Discord channels
    const streams = {};
    for (let user in twitterstreams) {
        streams[user] = TwitterBot.stream("statuses/filter", {follow: user});
        streams[user].on("tweet", function (tweet) {
            let url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
            twitterstreams[user].forEach(channelID => {
                try {
                    client.channels.fetch(channelID).then(channel => {
                        channel.send(url);
                    }).catch(console.error)
                } catch (error) {
                    console.log(error);
                }
            });
        });
        console.log(`Stream event has successfully been created for Twitter ID ${user}`);
    }

    async function setStatus() {
        // randomly choose a status group
        let statusGroup = statuses[Math.floor(Math.random() * statuses.length)];
    
        // get the status type
        let statusType = Object.keys(statusGroup)[0];
    
        // randomly choose a status from the group
        let status = Object.values(statusGroup);
        status = status[0][Math.floor(Math.random() * status[0].length)];
    
        client.user.setActivity(status, {type: statusType})
            .then(presence => console.log(`\nActivity set to \"${presence.activities[0].type} ${presence.activities[0].name}\"`))
            .catch(console.error);
    }
};