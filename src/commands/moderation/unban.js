const { logsChannel } = require('../../../config.json');
const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    await interaction.deferReply();

    if (targetUser.id === interaction.guild.members.me.id) {
        await interaction.editReply("nice try bozo");
        return;
    }
    
    try {
      await interaction.guild.bans.fetch(targetUserId);
    } catch {
      await interaction.editReply("That user ID is not banned.");
      return;
    }

    try {
      await interaction.guild.bans.remove(targetUserId, reason);
      await interaction.editReply(`User with ID ${targetUserId} has been unbanned (${reason})`);

      // Log the action in the logs channel
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00') // Green color for unbans
          .setTitle('User Unbanned')
          .addFields(
            { name: 'User Unbanned', value: `${targetUserId}`, inline: true },
            { name: 'Unbanned By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true }
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
  description: 'Unbans a user from the server using their user ID.',
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
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
