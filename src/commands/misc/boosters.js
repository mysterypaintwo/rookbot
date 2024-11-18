const { RookEmbed } = require('../../classes/embed/rembed.class.js')

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
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
      let props = {
        color: "#00BFFF",
        title: {
          text: "Server Boost Info"
        },
        description: [
          `**Total Boosters:** ${boosts}`,
          `**Boost Level:** ${boostLevel}`
        ],
        footer: `Requested by ${interaction.user.tag}`
      }
      const embed = new RookEmbed(props)

      // Send the embed as a reply to the command
      await interaction.editReply({ embeds: [ embed ] });
    } catch (error) {
      console.log(`Error fetching boost info: ${error.stack}`);
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "There was an error fetching the server's boost information."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ] });
    }
  },

  name: 'boosters',
  description: 'Displays the number of boosters and the server boost level.',
  permissionsRequired: [],
  botPermissions: [],
};
