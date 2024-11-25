const { RookEmbed } = require('../../classes/embed/rembed.class');
const { changeNickname } = require('../../utils/changeNickname');  // Import the changeNickname function

module.exports = {
  execute: async (client, interaction) => {
    const guildID = interaction.guild.id;
    const userID = '1111517386588307536';
    const doiGuildID = '1282788953052676177';
    const isDoI = interaction.guild.id === doiGuildID;

    // Ensure the command is properly deferred and acknowledged with ephemeral response
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const guild = await client.guilds.fetch(guildID);
      if (!guild) {
        throw new Error("Guild not found.");
      }
        
      const member = await guild.members.fetch(userID, { force: true }).catch(err => {
        console.error("Fetch error:", err);
      });
            
      if (!member || !member.user) {
        throw new Error("Member not found or invalid data.");
      }

      // Call the utility function to change the nickname
      const result = await changeNickname(client, member, isDoI);
    
      let players = {}
      players["user"] = {
        name: interaction.user.displayName,
        avatar: interaction.user.avatarURL(),
        username: interaction.user.username
      }
      players["target"] = {
        name: member.displayName,
        avatar: member.user.displayAvatarURL()
      }
      
      if (result.success) {
        const props = {
          title: {
            text: "Nickname Changed",
          },
          description: result.message,
          players: players
        };
        const embed = new RookEmbed(props);
        await interaction.editReply({ ephemeral: true, embeds: [embed] });
        console.log(result.message);
      } else {
        const errorProps = {
          color: "#FF0000",
          title: { text: "Error" },
          description: result.message,
        };
        const embed = new RookEmbed(errorProps);
        await interaction.editReply({ ephemeral: true, embeds: [embed] });
      }
    } catch (error) {
      let props = {
        color: "#FF0000",
        title: { text: "Error" },
        description: "There was an error changing the nickname.",
      };
      const embed = new RookEmbed(props);
      await interaction.editReply({ ephemeral: true, embeds: [embed] });
      console.error("Error changing nickname:", error);
    }
  },

  name: 'castlename',
  description: 'Immediately triggers a nickname change for castle, to a random castle-esque name.',
  //permissionsRequired: ['MANAGE_NICKNAMES'],
  botPermissions: ['MANAGE_NICKNAMES'],
};
