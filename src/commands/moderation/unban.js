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
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    try {
      // Unban the user
      await interaction.guild.bans.remove(targetUserId, reason);

      // Get the user object for the unbanned user
      const targetUser = await client.users.fetch(targetUserId);

      // Reply publicly in the channel to confirm the unban
      interaction.channel.send(`User **${targetUser.tag}** (ID: ${targetUserId}) has been **unbanned**. (${reason})`);

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(CONFIG.logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00') // Green color for unban
          .setTitle('✅ User Unbanned')
          .addFields(
            { name: 'User Unbanned', value: `${targetUser.tag} (ID: ${targetUserId})`, inline: true },
            { name: 'Unbanned By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }

      // Delete the deferred private reply to stop the "thinking" state
      await interaction.deleteReply();
    } catch (error) {
      console.log(`There was an error when unbanning: ${error}`);
      await interaction.editReply({ content: "I couldn't unban that user.", ephemeral: true }); // Private error message
    }
  },

  name: 'unban',
  description: 'Unbans a user from the server.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to unban.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for unbanning the user.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};

export default func
