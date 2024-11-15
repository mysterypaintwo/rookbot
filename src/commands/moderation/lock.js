const { logsChannel } = require('../../../config.json');
const { Client, Interaction, PermissionFlagsBits } = require('discord.js');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    // Check if the user has permission to manage channels
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply("You don't have permission to execute this command.");
      return;
    }

    const channel = interaction.channel; // The channel where the command is called

    try {
      // Lock the channel by removing the SEND_MESSAGES permission for @everyone
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SEND_MESSAGES: false, // Lock the channel by denying message sending
      });

      await interaction.editReply(`The channel ${channel.name} has been locked.`);

      // Log the action in the logs channel
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000') // Red color for locks
          .setTitle('Channel Locked')
          .addFields(
            { name: 'Channel Locked', value: `${targetChannel.name} (${targetChannel.id})`, inline: true },
            { name: 'Locked By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`Error in lock command: ${error}`);
      await interaction.editReply("An error occurred while trying to lock the channel.");
    }
  },

  name: 'lock',
  description: 'Locks the current channel.',
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
