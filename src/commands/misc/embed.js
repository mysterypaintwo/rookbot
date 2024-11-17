import { EmbedBuilder } from 'discord.js'

let func = {
  name: 'embed',
  description: 'Sends an embed with predefined content',

  /**
   * Sends an embed message in response to a slash command interaction.
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    // Acknowledge the interaction immediately without sending a reply yet
    await interaction.deferReply(); // This avoids the bot "waiting for a response"

    const embed = new EmbedBuilder()
      .setTitle('Embed title')
      .setDescription('This is an embed description')
      .setURL('https://justinbohemier.wixsite.com/portfolio/game-design')
      .setColor('Random')
      .setFields(
        {
          name: 'Field title',
          value: 'Some random value',
          inline: true,
        },
        {
          name: '2nd Field title',
          value: 'Some random value',
          inline: true,
        },
        {
          name: '3rd Field title',
          value: 'Some random value',
          inline: true,
        }
      )
      .setImage('https://pbs.twimg.com/media/GcPyiUlasAEEtPJ?format=jpg&name=900x900')
      .setTimestamp()
      .setFooter({
        text: 'Footer text',
        iconURL: 'https://pbs.twimg.com/media/GcPyiUlasAEEtPJ?format=jpg&name=900x900'
      });

    // Send the embed to the channel
    await interaction.editReply({ embeds: [embed] }); // Edit the initial deferred reply to send the embed
  },
};

export default func
