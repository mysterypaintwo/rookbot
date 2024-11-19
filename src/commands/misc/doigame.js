const { serverGameName_base64encoded } = require('../../../config.json');
const { RookEmbed } = require('../../classes/embed/rembed.class');

// Decode the base64 string
const serverGameName = Buffer.from(serverGameName_base64encoded, 'base64').toString('utf-8');

module.exports = {
  execute: async (client, interaction) => {
    const guildID = interaction.guild.id;
    const guildMeta = require(`../../dbs/${guildID}/meta.json`);

    // Ensure the command is properly deferred and acknowledged
    await interaction.deferReply();

    try {
      // Create an embed message
      let props = {
        color: "#00FF00",
        title: {
          text: `Download ${serverGameName}`,
          url: guildMeta["downloads"]
        },
        description: `You can download ${serverGameName} below!`,
        fields: [
          { name: 'Download Link', value: `[__Click here to download the Latest Game Version__](${guildMeta['downloads']})`, inline: false },
          { name: 'Need Help?', value: `For more detailed setup instructions, please refer to [our Support Thread](${guildMeta['supportpost']}).`, inline: false }
        ]
      }
      const embed = new RookEmbed(props)

      // Reply to the command with the embed
      await interaction.editReply({ embeds: [ embed ] });
    } catch (error) {
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "There was an error posting the download information."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ] });
    }
  },

  name: 'doigame',
  description: `Sends a message with download info for *${serverGameName}*.`, // Use decoded string here
  permissionsRequired: [],
  botPermissions: [],
};
