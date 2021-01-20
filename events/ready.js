// ready.js

///// imports
const path = require('path');

///// constants
const statuses = [
    {'WATCHING': ['over the moon', 'the ocean', 'over the winter', 'a useless gem', 'the jellyfish']},
    {'LISTENING': ['the fireflies', 'nothing', 'Sensei']}
// custom doesn't seem to work    {'CUSTOM': ['useless three and a half', 'i hate phos']}
];


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
            ['emote', 'Emote and Reaction Commands'],
            ['wiki', 'Gem Wiki Information'],
        ])
        .registerDefaultGroups()
        .registerDefaultCommands()
        .registerCommandsIn(path.join(__dirname,`../`,`/commands`));


    async function setStatus() {
        // randomly choose a status group
        let statusGroup = statuses[Math.floor(Math.random() * statuses.length)];
    
        // get the status type
        let statusType = Object.keys(statusGroup)[0];
    
        // randomly choose a status from the group
        let status = Object.values(statusGroup);
        status = status[0][Math.floor(Math.random() * status[0].length)];
    
        client.user.setActivity(status, {type: statusType})
            .then(presence => console.log(`\nActivity set to \'${presence.activities[0].type} ${presence.activities[0].name}\'`))
            .catch(console.error);
    }
};