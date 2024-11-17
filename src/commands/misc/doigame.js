import * as CONFIG from '../../../config.json' with { type: "json" }
import { EmbedBuilder } from'discord.js'

// Decode the base64 string
const serverGameName = Buffer.from(CONFIG.default.serverGameName_base64encoded, 'base64').toString('utf-8');

let func = {
  execute: async (client, interaction) => {
    // Ensure the command is properly deferred and acknowledged
    await interaction.deferReply();

    try {
      // Create an embed message
      const embed = new EmbedBuilder()
        .setColor('#00FF00') // Green color for positive action
        .setTitle(`Download ${serverGameName}`)
        .setDescription(`You can download ${serverGameName} below!`)
        .addFields(
          { name: 'Download Link', value: `[__Click here to download the Latest Game Version__](${CONFIG.downloadsChannel})`, inline: false },
          { name: 'Need Help?', value: `For more detailed setup instructions, please refer to [our Support Thread](${CONFIG.supportPost}).`, inline: false }
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
  description: `Sends a message with download info for *${serverGameName}*.`, // Use decoded string here
  permissionsRequired: [],
  botPermissions: [],
};

export default func
