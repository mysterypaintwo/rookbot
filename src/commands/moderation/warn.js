const { logsChannel } = require('../../../config.json');
const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get('target-user').value;
    // Get the reason, or fall back to a default value if not provided
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (targetUser.id === interaction.guild.members.me.id) {
        await interaction.editReply("nice try bozo");
        return;
    }
    
    if (!targetUser) {
      await interaction.editReply("That user doesn't exist in this server.");
      return;
    }

    // Send a DM warning to the target user
    try {
      await targetUser.send(`⚠️ You have been warned in ${interaction.guild.name} (${reason})`);
      await interaction.editReply(`User ${targetUser} has been warned.`);

      // Log the action in the logs channel
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FFA500') // Orange color for warnings
          .setTitle('User Warned')
          .addFields(
            { name: 'User Warned', value: `${targetUser.user.tag} (${targetUser.user.id})`, inline: true },
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
      await interaction.editReply("Couldn't send a warning to that user (possibly due to their DM settings).");
      console.log(`Failed to send warning: ${error}`);
    }
  },

  name: 'warn',
  description: 'Warns a member in the server.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to warn.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the warning.',
      type: ApplicationCommandOptionType.String,
      required: false, // Make sure it's optional
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
};
