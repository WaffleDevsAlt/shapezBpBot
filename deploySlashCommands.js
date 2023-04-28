require('dotenv').config()
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const { selfClientId, developmentGuildId } = require('./config.json')
const commands = [];
// Grab all the command files from the slashcommands directory you created earlier
const commandFiles = fs.readdirSync('./slashcommands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./slashcommands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(selfClientId, developmentGuildId),
			{ body: commands },
		);
        
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();