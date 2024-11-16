const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logsChannel, serverName } = require('../../../config.json');

module.exports = {
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

    // Get the user to be banned and kicked
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply({ content: "User not found.", ephemeral: true }); // Private error message
      return;
    }

    // Attempt to ban the user regardless of whether they are in the server
    try {
      await interaction.guild.members.ban(targetUserId, { reason });

      // Check if the user is currently in the server (guild)
      const guildMember = interaction.guild.members.cache.get(targetUserId);

      // If the user is in the server, kick them
      if (guildMember) {
        try {
          await interaction.guild.members.kick(targetUserId, { reason });
        } catch (kickError) {
          console.log(`Failed to kick user: ${kickError.message}`);
          await interaction.followUp({ content: "I couldn't kick the user from the server.", ephemeral: true }); // Private follow-up
        }
      }

      // Determine the name to display (either nickname or username)
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the ban (and kick if applicable)
      interaction.channel.send(`User **${targetUserName}** (ID: ${targetUserId}) has been **kick-banned**. (${reason})`);

      // Try to DM the user about the ban (and kick if applicable)
      try {
        await targetUser.send(`You have been banned${guildMember ? ' and kicked' : ''} from the ${serverName} server. (${reason})`);
      } catch (dmError) {
        console.log(`Failed to DM user: ${dmError.message}`);
        await interaction.followUp({ content: "I couldn't send the DM to the user. They might have DMs disabled.", ephemeral: true }); // Private follow-up
      }

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FF5733') // Orange-red color for ban & kick
          .setTitle('🚫🔒 User Banned and Kicked')
          .addFields(
            { name: 'User', value: `${targetUserName} (ID: ${targetUserId})`, inline: true },
            { name: 'Actioned By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true },
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
      console.log(`There was an error when banning the user: ${error}`);
      await interaction.editReply({ content: "I couldn't ban the user.", ephemeral: true }); // Private error message
    }
  },

  name: 'kickban',
  description: 'Bans a user from the server, and kicks them if they are currently in the server.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to ban and kick.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for banning and kicking the user.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers],
};
