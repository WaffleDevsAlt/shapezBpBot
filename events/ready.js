const {log} = require('../utilities')

module.exports = (client) => {
    log(client, `Online as ${client.user.username}#${client.user.discriminator} with prefix \`${client.config.prefix}\`. I am in ${client.guilds.cache.size} servers that have ${client.channels.cache.size} channels and ${client.users.cache.size} members.`)
    client.slashCommandDetails = client.slashcommands.map(scommand => {
        return { name: `/${scommand.name}`, value: `${scommand.description}`, enabled: scommand.enabled  };
    }).filter(command => command.enabled === true)
    client.prefixCommandDetails = client.commands.map(pcommand => {
        return { name: `!${pcommand.name}`, value: `${pcommand.description}`, enabled: pcommand.enabled };
        
    }).filter(command => command.enabled === true)
}