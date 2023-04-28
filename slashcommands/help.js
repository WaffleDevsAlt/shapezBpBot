const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows the help menu!'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Main Help Page')
			.setURL('https://discord.js.org')
			.setDescription('Some description here')
			.addFields(
				interaction.client.prefixCommandDetails
			)
            .addFields(
                interaction.client.slashCommandDetails
            )
        let data = { content: '', embeds: [embed]}
		await interaction.reply(data);
	},
	
};

module.exports.name = "help";
module.exports.description = "Shows the help page that contains all commands and their uses."
module.exports.enabled = true;