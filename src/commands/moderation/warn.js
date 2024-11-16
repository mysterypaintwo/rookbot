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

    // Get the user to be warned
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply({ content: "User not found.", ephemeral: true }); // Private error message
      return;
    }

    // Check if the user is in the server (guild)
    const guildMember = interaction.guild.members.cache.get(targetUserId);
    if (!guildMember) {
      await interaction.editReply({ content: "User is not in the server.", ephemeral: true }); // Private error message
      return;
    }

    // Attempt to warn the user
    try {
      // Determine the name to display
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the warning
      interaction.channel.send(`User **${targetUserName}** (ID: ${targetUserId}) has been **warned**. (${reason})`);

      // Try to DM the user about the warning (private)
      try {
        await targetUser.send(`⚠️ You have been warned in the ${serverName} server. (${reason})`);
      } catch (dmError) {
        console.log(`Failed to DM user: ${dmError.message}`);
        await interaction.followUp({ content: "I couldn't send the DM to the user. They might have DMs disabled.", ephemeral: true }); // Private follow-up
      }

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FF8C00') // Orange color for warnings
          .setTitle('⚠️ User Warned')
          .addFields(
            { name: 'User Warned', value: `${targetUserName} (ID: ${targetUserId})`, inline: true },
            { name: 'Warned By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`There was an error when warning: ${error}`);
      await interaction.editReply({ content: "I couldn't warn that user.", ephemeral: true }); // Private error message
    }
  },

  name: 'warn',
  description: 'Warns a user in the server.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to warn.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for warning the user.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
};
