const { SlashCommandBuilder } = require('@discordjs/builders');
const { deserialize } = require('../blueprintUtilites');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('deserializestring')
		.setDescription('Decodes the provided blueprint string.')
		.addBooleanOption(option =>
			option.setName('format')
				.setDescription('Whether or not the result should be formated or not.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('string')
				.setDescription('The blueprint string.')
				.setRequired(true)),

	async run(interaction) {
		try{
			let blueprintstring;
			let format;
			blueprintstring = interaction.options._hoistedOptions.filter((option) => {
				return option.name == "string"
			})[0].value
			format = interaction.options._hoistedOptions.filter((option) => {
				return option.name == "format"
			})[0].value

			let decoded = await deserialize(blueprintstring);
	
			// If there is a file and argument 0 is "format" OR there is no file and arg 1 is "format"
			if(format) decoded = JSON.stringify(decoded, null, 4);
			else decoded = JSON.stringify(decoded); //Else no format nicely
	
			interaction.reply({ files: [{attachment: Buffer.from(decoded, "utf8"), name: 'deserialized.txt'}] })



	} catch(e) {console.log(e)}


	},
};

module.exports.name = "deserializestring";
module.exports.description = "Decodes the provided blueprint string."
module.exports.enabled = true;