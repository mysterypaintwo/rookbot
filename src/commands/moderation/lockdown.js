const { logsChannel } = require('../../../config.json');
const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const lockdownStatus = interaction.options.getBoolean('status'); // Get the true/false status for the lockdown

    await interaction.deferReply();

    // Check if the user has permission to manage channels
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply("You don't have permission to execute this command.");
      return;
    }

    try {
      // Get all channels in the guild
      const channels = interaction.guild.channels.cache.filter((channel) => channel.isTextBased());

      // Loop through the channels and lock/unlock them based on the status
      for (const channel of channels.values()) {
        // If the channel has @everyone permission to send messages, modify the permission
        const everyonePermission = channel.permissionsFor(interaction.guild.roles.everyone);
        
        // If the lockdown is enabled (status true), lock the channel
        if (lockdownStatus) {
          // If @everyone can send messages, lock the channel
          if (everyonePermission.has('SEND_MESSAGES')) {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
              SEND_MESSAGES: false, // Lock the channel by disabling message sending for everyone
            });
          }
        } else {
          // If the lockdown is disabled (status false), unlock the channel
          if (!everyonePermission.has('SEND_MESSAGES')) {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
              SEND_MESSAGES: true, // Unlock the channel by enabling message sending for everyone
            });
          }
        }
      }

      const statusMessage = lockdownStatus ? "locked down" : "unlocked";
      await interaction.editReply(`All applicable channels have been ${statusMessage}.`);

      // Log the action in the logs channel
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor(action === 'lock' ? '#FF0000' : '#00FF00') // Red for lock, Green for unlock
          .setTitle(`Channel ${action === 'lock' ? 'Locked' : 'Unlocked'}`)
          .addFields(
            { name: 'Channel', value: `${channel.name} (${channel.id})`, inline: true },
            { name: 'Actioned By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`Error in lockdown command: ${error}`);
      await interaction.editReply("An error occurred while trying to apply the lockdown.");
    }
  },

  name: 'lockdown',
  description: 'Locks or unlocks all channels where @everyone can speak in the server.',
  options: [
    {
      name: 'status',
      description: 'True to lock the channels, false to unlock them.',
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
