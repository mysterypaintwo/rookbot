import { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } from 'discord.js'
import * as CONFIG from '../../../config.json' with { type: "json" }

let func = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    const targetUserInput = interaction.options.get('user-id').value;
    const timeoutDuration = interaction.options.get('duration').value; // Duration in seconds
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be timed out
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply({ content: "User not found.", ephemeral: true });
      return;
    }

    // Get the guild member (to fetch nickname if present)
    const guildMember = interaction.guild.members.cache.get(targetUserId);

    try {
      // Convert the timeout duration from seconds to milliseconds
      const timeoutDurationMilliseconds = timeoutDuration * 1000;

      // Set the timeout (mute and prevent interactions)
      await guildMember.timeout(timeoutDurationMilliseconds, reason);

      // Determine the name to display (use nickname if available, otherwise default to tag or username)
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the timeout
      interaction.channel.send(`User **${targetUserName}** (ID: ${targetUserId}) has been **timed out** for ${timeoutDuration} seconds. (${reason})`);

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(CONFIG.logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FF8800') // Orange color for timeout
          .setTitle('⏰ User Timeout')
          .addFields(
            { name: 'User', value: `${targetUserName} (ID: ${targetUserId})`, inline: true },
            { name: 'Timeout Duration', value: `${timeoutDuration} seconds`, inline: true },
            { name: 'Timeout By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }

      // Delete the deferred private reply to avoid it being left pending
      await interaction.deleteReply();
    } catch (error) {
      console.log(`There was an error when timing out the user: ${error}`);
      await interaction.editReply({ content: "I couldn't timeout that user.", ephemeral: true }); // Private error message
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
      name: 'duration',
      description: 'The duration of the timeout in seconds.',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the timeout.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
};

export default func
