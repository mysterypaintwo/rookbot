const { EmbedBuilder } = require('discord.js');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
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
      const embed = new EmbedBuilder()
        .setColor('#00FF00') // Green color for success
        .setTitle('Total Member Count')
        .setDescription(`There are currently ${totalMembers} registered members in this server!\n(Count includes staff and excludes our ${totalBots} bots.)`)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      // Send the embed as a reply to the command
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(`Error fetching member count: ${error}`);
      await interaction.editReply("There was an error fetching the member count.");
    }
  },

  name: 'membercount',
  description: `Displays the total number of registered members on the server.`,
  permissionsRequired: [],
  botPermissions: [],
};
