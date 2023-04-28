module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const cmd = interaction.client.slashcommands.get(interaction.commandName);
    //console.log(interaction.client.slashcommands)
    if (!cmd) {
        console.error(`No slashcommand matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        if(!cmd.run && cmd.execute) {
            cmd.run = async (interaction) => {
                await cmd.execute(interaction)
                const filter = (btnInt) => interaction.user.id === btnInt.user.id;

                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
                
                collector.on('collect', async i => {
                    const buttonaction = i.client.buttonactions.get(i.customId);
                    console.log(i.customId,buttonaction)
                    buttonaction.run(i)
                    //await i.update({ content: 'A button was clicked!', components: [] });
                });

                collector.on('end', collected => {
                    console.log(`Collected ${collected.size} items`)
                    interaction.deleteReply();
                });
            }
        }

        await cmd.run(interaction);
        
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this slashcommand!', ephemeral: true });
    }
}
