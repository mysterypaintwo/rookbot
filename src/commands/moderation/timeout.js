const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logsChannel } = require('../../../config.json');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const targetUserInput = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';
    const duration = interaction.options.get('duration').value;

    await interaction.deferReply();

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be timed out
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply("User not found.");
      return;
    }

    // Attempt to timeout the user
    try {
      // Apply timeout to the user
      await interaction.guild.members.timeout(targetUserId, duration * 1000, reason);

      // Reply in the channel to confirm
      await interaction.editReply(`User ${targetUserId} has been timed out for ${duration} seconds (${reason})`);

      // Log the action in the logs channel
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#800080') // Purple color for timeouts
          .setTitle('User Timed Out')
          .addFields(
            { name: 'User Timed Out', value: `${targetUserId}`, inline: true },
            { name: 'Timed Out By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Duration', value: `${duration} seconds`, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`There was an error when timing out: ${error}`);
      await interaction.editReply("I couldn't timeout that user.");
    }
  },

  name: 'timeout',
  description: 'Times out a user for a specified duration.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to timeout.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for timing out the user.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'duration',
      description: 'The duration of the timeout in seconds.',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
};
