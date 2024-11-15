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

    // Get the user to be unbanned
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply("User not found.");
      return;
    }

    // Attempt to unban the user
    try {
      // Unban the user from the server
      await interaction.guild.bans.remove(targetUserId, reason);

      // Reply in the channel to confirm
      await interaction.editReply(`User ${targetUserId} has been unbanned (${reason})`);

      // Log the action in the logs channel
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#008000') // Green color for unbans
          .setTitle('User Unbanned')
          .addFields(
            { name: 'User Unbanned', value: `${targetUserId}`, inline: true },
            { name: 'Unbanned By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`There was an error when unbanning: ${error}`);
      await interaction.editReply("I couldn't unban that user.");
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
