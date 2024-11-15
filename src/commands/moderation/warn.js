const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logsChannel, serverName } = require('../../../config.json');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const targetUserInput = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    await interaction.deferReply();

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be warned
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply("User not found.");
      return;
    }

    // Get the guild member (to fetch nickname if present)
    const guildMember = interaction.guild.members.cache.get(targetUserId);

    // Attempt to send a warning to the user
    try {
      // Send a DM to the user
      await targetUser.send(`You have been warned in the ${serverName} server (${reason})`);

      // Determine the name to display (use nickname if available, otherwise default to tag or username)
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply in the channel to confirm
      await interaction.editReply(`User ${targetUserName} (ID: ${targetUserId}) has been warned (${reason})`);

      // Log the action in the logs channel
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FFFF00') // Yellow color for warnings
          .setTitle('User Warned')
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
      await interaction.editReply("I couldn't warn that user.");
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
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
};
