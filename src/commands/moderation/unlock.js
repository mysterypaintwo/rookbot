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

    // Get the channel provided by the user in the command options
    const channel = interaction.options.getChannel('channel');

    // Check if the channel is a text channel
    if (!channel || channel.type !== 'GUILD_TEXT') {
      await interaction.editReply("Please specify a valid text channel.");
      return;
    }

    try {
      // Check if @everyone has permission to send messages in the specified channel
      const everyonePermission = channel.permissionsFor(interaction.guild.roles.everyone);

      // If @everyone does not have permission to send messages, unlock the channel
      if (!everyonePermission.has('SEND_MESSAGES')) {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SEND_MESSAGES: true, // Unlock the channel by enabling message sending
        });

        await interaction.editReply(`The channel ${channel.name} has been unlocked.`);
      } else {
        await interaction.editReply(`The channel ${channel.name} is already unlocked.`);
      }

      // Log the action in the logs channel
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00') // Green color for unlocks
          .setTitle('Channel Unlocked')
          .addFields(
            { name: 'Channel Unlocked', value: `${targetChannel.name} (${targetChannel.id})`, inline: true },
            { name: 'Unlocked By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`Error in unlock command: ${error}`);
      await interaction.editReply("An error occurred while trying to unlock the channel.");
    }
  },

  name: 'unlock',
  description: 'Unlocks a specified channel.',
  options: [
    {
      name: 'channel',
      description: 'The channel you want to unlock.',
      type: 7, // Channel type
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
