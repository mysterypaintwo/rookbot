const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    const guildID = interaction.guild_id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const targetUserInput = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be banned
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      await interaction.editReply({ content: "User not found.", ephemeral: true }); // Private error message
      return;
    }

    // Get the guild member (to fetch nickname if present)
    const guildMember = interaction.guild.members.cache.get(targetUserId);

    // Attempt to ban the user
    try {
      // Ban the user from the server
      await interaction.guild.members.ban(targetUserId, { reason });

      // Determine the name to display (use nickname if available, otherwise default to tag or username)
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the ban
      interaction.channel.send(`User **${targetUserName}** (ID: ${targetUserId}) has been **banned**. (${reason})`);

      // Try to DM the user about the ban (private)
      try {
        await targetUser.send(`You have been banned from the ${interaction.guild.name} server. (${reason})`);
      } catch (dmError) {
        console.log(`Failed to DM user: ${dmError.message}`);
        await interaction.followUp({ content: "I couldn't send the DM to the user. They might have DMs disabled.", ephemeral: true }); // Private follow-up
      }

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(guildChannels["logging"]);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000') // Red color for bans
          .setTitle('🔨 User Banned')
          .addFields(
            { name: 'User Banned', value: `${targetUserName} (ID: ${targetUserId})`, inline: true },
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
      console.log(`There was an error when banning: ${error.stack}`);
      await interaction.editReply({ content: "I couldn't ban that user.", ephemeral: true }); // Private error message
    }
  },

  name: 'ban',
  description: 'Bans a user from the server.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to ban.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for banning the user.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
