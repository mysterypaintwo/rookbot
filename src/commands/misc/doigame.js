const { downloadsChannel, supportPost } = require('../../../config.json');
const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  callback: async (client, interaction) => {
    // Ensure the command is properly deferred and acknowledged
    await interaction.deferReply();

    try {
      // Fetch the channel using the ID from the config
      //const dlChannel = await client.channels.fetch(downloadsChannel);
      
      // Create an embed message
      const embed = new EmbedBuilder()
        .setColor('#00FF00') // Green color for positive action
        .setTitle('Download *The Legend of Zelda - Dungeons of Infinity*')
        .setDescription('You can download The Legend of Zelda - Dungeons of Infinity in the channel below!')
        .addFields(
          { name: 'Download Link', value: `[Click here to go to the downloads channel](${downloadsChannel})`, inline: false },
          { name: 'Need Help?', value: `If you need any help with troubleshooting, please refer to [our Support Thread](${supportPost}).`, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      // Reply to the command with the embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(`Error posting download information: ${error}`);
      await interaction.editReply("There was an error posting the download information.");
    }
  },

  name: 'doigame',
  description: 'Sends a message with download info for *The Legend of Zelda - Dungeons of Infinity*.',
  permissionsRequired: [],
  botPermissions: [],
};
