const { RookEmbed } = require('../../classes/embed/rembed.class');
const { changeNickname } = require('../../utils/changeNickname');  // Import the changeNickname function

module.exports = {
  execute: async (client, interaction) => {
    const guildID = interaction.guild.id;
    const userID = 1111517386588307536;

    // Ensure the command is properly deferred and acknowledged
    await interaction.deferReply();

    try {
      const guild = await client.guilds.fetch(guildID);
      const member = await guild.members.fetch(userID);

      if (!member) {
        console.error(`Member with ID ${userID} not found in guild ${guildID}.`);
        return await interaction.editReply({ content: "User not found!" });
      }

      // Call the utility function to change the nickname
      const result = await changeNickname(member, interaction.guild.id);

      if (result.success) {
        const props = {
          title: {
            text: "Nickname Changed",
          },
          description: `${member.user.tag}'s nickname has been changed to "${result.message}".`,
        };
        const embed = new RookEmbed(props);
        await interaction.editReply({ embeds: [embed] });
        console.log(result.message);
      } else {
        const errorProps = {
          color: "#FF0000",
          title: {
            text: "Error"
          },
          description: result.message,
        };
        const embed = new RookEmbed(errorProps);
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "There was an error changing the nickname."
      };
      const embed = new RookEmbed(props);
      await interaction.editReply({ embeds: [embed] });
      console.error("Error changing nickname:", error);
    }
  },

  name: 'castlename',
  description: 'Immediately triggers a nickname change for castle, to a random castle-esque name.',
  //permissionsRequired: ['MANAGE_NICKNAMES'],
  botPermissions: ['MANAGE_NICKNAMES'],
};
