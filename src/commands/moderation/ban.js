const { logsChannel } = require('../../../config.json');

const {
    Client,
    Interaction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } = require('discord.js');
  
  module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
  
    callback: async (client, interaction) => {
      const targetUserId = interaction.options.get('target-user').value;
      const reason =
        interaction.options.get('reason')?.value || 'No reason provided';
  
      await interaction.deferReply();
  
      const targetUser = await interaction.guild.members.fetch(targetUserId);
  
      if (!targetUser) {
        await interaction.editReply("That user doesn't exist in this server.");
        return;
      }
  
      if (targetUser.id === interaction.guild.ownerId) {
        await interaction.editReply(
          "You can't ban that user because they're the server owner."
        );
        return;
      }
  
      const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
      const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
      const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
  
      if (targetUserRolePosition >= requestUserRolePosition) {
        await interaction.editReply(
          "You can't ban that user because they have the same/higher role than you."
        );
        return;
      }
  
      if (targetUserRolePosition >= botRolePosition) {
        await interaction.editReply(
          "I can't ban that user because they have the same/higher role than me."
        );
        return;
      }

      if (targetUser.id === interaction.guild.members.me.id) {
        await interaction.editReply("nice try bozo");
        return;
      }

      // Ban the targetUser
      try {
        await targetUser.ban({ reason });
        await interaction.editReply(
          `User ${targetUser} was banned (${reason})`
        );

        // Log the action in the logs channel
        const logs = client.channels.cache.get(logsChannel);
        if (logs) {
            const embed = new EmbedBuilder()
            .setColor('#FF0000') // Red color for bans
            .setTitle('User Banned')
            .addFields(
                { name: 'User Banned', value: `${targetUser.user.tag} (${targetUser.user.id})`, inline: true },
                { name: 'Banned By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Actioned by ${interaction.user.tag}` });

            logs.send({ embeds: [embed] });
        } else {
            console.log("Logs channel not found.");
        }
      } catch (error) {
        console.log(`There was an error when banning: ${error}`);
      }
    },
  
    name: 'ban',
    description: 'Bans a member from this server.',
    options: [
      {
        name: 'target-user',
        description: 'The user you want to ban.',
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: 'reason',
        description: 'The reason you want to ban.',
        type: ApplicationCommandOptionType.String,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],
  };