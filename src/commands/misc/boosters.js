import { Client, EmbedBuilder, MessageComponentInteraction } from 'discord.js'

let func = {
  /**
   *
   * @param {Client} client
   * @param {MessageComponentInteraction} interaction
   */
  execute: async (client, interaction) => {
    // Defer the reply to give the bot time to process the request
    await interaction.deferReply();

    try {
      // Get the number of boosts in the server
      const boosts = interaction.guild.premiumSubscriptionCount;

      // Get the server's boost level
      const boostLevel = interaction.guild.premiumTier;

      // Prepare a message to show the boost information
      const embed = new EmbedBuilder()
        .setColor('#00BFFF') // Blue color for boost info
        .setTitle('Server Boost Info')
        .setDescription(`
          **Total Boosters:** ${boosts}
          **Boost Level:** ${boostLevel}
        `)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      // Send the embed as a reply to the command
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(`Error fetching boost info: ${error}`);
      await interaction.editReply("There was an error fetching the server's boost information.");
    }
  },

  name: 'boosters',
  description: 'Displays the number of boosters and the server boost level.',
  permissionsRequired: [],
  botPermissions: [],
};

export default func
