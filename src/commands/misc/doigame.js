const { serverGameName_base64encoded } = require('../../../config.json');
const { EmbedBuilder } = require('discord.js');

// Decode the base64 string
const serverGameName = Buffer.from(serverGameName_base64encoded, 'base64').toString('utf-8');

module.exports = {
  execute: async (client, interaction) => {
    const guildID = interaction.guild_id;
    const guildMeta = require(`../../dbs/${guildID}/meta.json`);

    // Ensure the command is properly deferred and acknowledged
    await interaction.deferReply();

    try {
      // Create an embed message
      const embed = new EmbedBuilder()
        .setColor('#00FF00') // Green color for positive action
        .setTitle(`Download ${serverGameName}`)
        .setDescription(`You can download ${serverGameName} below!`)
        .addFields(
          { name: 'Download Link', value: `[__Click here to download the Latest Game Version__](${guildMeta['downloads']})`, inline: false },
          { name: 'Need Help?', value: `For more detailed setup instructions, please refer to [our Support Thread](${guildMeta['supportpost']}).`, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      // Reply to the command with the embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(`Error posting download information: ${error.stack}`);
      await interaction.editReply("There was an error posting the download information.");
    }
  },

  name: 'doigame',
  description: `Sends a message with download info for *${serverGameName}*.`, // Use decoded string here
  permissionsRequired: [],
  botPermissions: [],
};
