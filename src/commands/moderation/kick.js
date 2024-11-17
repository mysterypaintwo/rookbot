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

    // Get the user to be kicked
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

    // Attempt to kick the user
    try {
      // Kick the user from the server
      await interaction.guild.members.kick(targetUserId, { reason });

      // Determine the name to display
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the kick
      interaction.channel.send(`User **${targetUserName}** (ID: ${targetUserId}) has been **kicked**. (${reason})`);

      // Try to DM the user about the kick (private)
      try {
        await targetUser.send(`You have been kicked from the ${CONFIG.serverName} server. (${reason})`);
      } catch (dmError) {
        console.log(`Failed to DM user: ${dmError.message}`);
        await interaction.followUp({ content: "I couldn't send the DM to the user. They might have DMs disabled.", ephemeral: true }); // Private follow-up
      }

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(CONFIG.logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000') // Red color for kicks
          .setTitle('👟💥🏃‍♂️ User Kicked')
          .addFields(
            { name: 'User Kicked', value: `${targetUserName} (ID: ${targetUserId})`, inline: true },
            { name: 'Kicked By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`There was an error when kicking: ${error}`);
      await interaction.editReply({ content: "I couldn't kick that user.", ephemeral: true }); // Private error message
    }
  },

  name: 'kick',
  description: 'Kicks a user from the server.',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user you want to kick.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for kicking the user.',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};

export default func
