const { RookEmbed } = require('../../classes/embed/rembed.class');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    // Defer the reply
    await interaction.deferReply();

    try {
      // Fetch all members in the server to ensure the data is up-to-date
      const members = await interaction.guild.members.fetch();

      // Filter out bot members
      const totalMembers = members.filter(member => !member.user.bot).size;

      // Filter out bot members for bot count
      const totalBots = members.filter(member => member.user.bot).size;

      // Create an embed to send the member count
      let players = {}
      players["user"] = {
        name: interaction.user.displayName,
        avatar: interaction.user.avatarURL(),
        username: interaction.user.username
      }
      players["target"] = {
        name: interaction.guild.name,
        avatar: interaction.guild.iconURL()
      }
      let props = {
        title: {
          text: "Total Member Count"
        },
        description: `There are currently ${totalMembers} registered members in this server!\n(Count includes staff and excludes our ${totalBots} bots.)`,
        players: players
      }
      const embed = new RookEmbed(props)

      // Send the embed as a reply to the command
      await interaction.editReply({ embeds: [ embed ] });
    } catch (error) {
      let props = {
        title: {
          text: "Error"
        },
        description: "There was an error fetching the member count."
      }
      const embed = new RookEmbed(props)
      console.log(`Error fetching member count: ${error.stack}`);
      await interaction.editReply({ embeds: [ embed ] });
    }
  },

  name: 'membercount',
  description: `Displays the total number of registered members on the server.`,
  permissionsRequired: [],
  botPermissions: [],
};
