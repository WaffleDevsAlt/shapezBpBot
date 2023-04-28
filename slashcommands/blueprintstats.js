const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { deserialize, formatBuilding, formatGroup } = require('../blueprintUtilites');
const { groups, buildings } = require('../buildingTranslations.json');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('blueprintstats')
		.setDescription('Provides stats of the given blueprint.')
		.addStringOption(option =>
			option.setName('string')
				.setDescription('The blueprint string.')
				.setRequired(true)),

	async run(interaction) {
		try{
			let blueprintstring;
			blueprintstring = interaction.options._hoistedOptions.filter((option) => {
				return option.name == "string"
			})[0].value

			let decoded = await deserialize(blueprintstring);
	
			const version = decoded["V"];
			const totalNumberOfBuildings = decoded.BP.Entries.length;
			const numberOfIndividualBuildings = {};
			let bpgroups = Object.assign({}, groups);
			for (const [key, value] of Object.entries(bpgroups)) {
				bpgroups[key].buildings = {};
				bpgroups[key].count = 0;
				if(!formatGroup(key).nested) bpgroups[key].nestedGroups = {};
			}
			console.log(bpgroups)
			// Calculate individual building numbers
			decoded.BP.Entries.forEach(entry => {
				if(!numberOfIndividualBuildings[entry.T]) numberOfIndividualBuildings[entry.T] = 0;
				numberOfIndividualBuildings[entry.T] += 1;
				bpgroups[formatBuilding(entry.T).group].count += 1
			});
			decoded.BP.Entries.forEach(entry => {
				let build = formatBuilding(entry.T);
				bpgroups[build.group].buildings[entry.T] = numberOfIndividualBuildings[entry.T]
			});
			
			for (const [key, value] of Object.entries(bpgroups)) {
				if(value.group) {
					bpgroups[value.group].count += bpgroups[key].count
				};
				const sortable = Object.entries(bpgroups[key].buildings)
					.sort(([,a],[,b]) => b-a)
					.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
				bpgroups[key].buildings = sortable
			}
			let finalstring = "";
			console.log(bpgroups)
			for (const [key, value] of Object.entries(bpgroups)) {
				let format = formatGroup(key);
				if(!format.nested) {
					if(!bpgroups[key].count == 0) finalstring += `* ${format.name}: ${bpgroups[key].count}\n`
					for (const [bKey, bVal] of Object.entries(bpgroups[key].buildings)) {
						if(!bpgroups[key].count == 0) finalstring += `  * ${formatBuilding(bKey).name}: ${bVal}\n`
					}
				}
				else {
					if(!bpgroups[key].count == 0) finalstring += `  * ${format.name}: ${bpgroups[key].count}\n`
					for (const [bKey, bVal] of Object.entries(bpgroups[key].buildings)) {
						if(!bVal == 0) finalstring += `   * ${formatBuilding(bKey).name}: ${bVal}\n`
					}
				}
			}
			console.log(finalstring)
			// const sortable = Object.entries(bpgroups[group])
			// .sort(([,a],[,b]) => b-a)
			// .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

			const statisticsEmbed = new EmbedBuilder()
				.setTitle("Blueprint Stats")
				.setDescription("Showing the statistics of the provided blueprint string.")
				.addFields(
					{
						name: "Version:",
						value: version.toString(),
					},
					{
						name: "Total Number of Buildings:",
						value: totalNumberOfBuildings.toString(),
					},
					{
						name: "Number of Individual Buildings:",
						value: finalstring.trim(),
					},
				)
	
			interaction.reply({ embeds: [statisticsEmbed] })
	} catch(e) {console.log(e)}


	},
};

module.exports.name = "blueprintstats";
module.exports.description = "Decodes the provided blueprint string."
module.exports.enabled = true;