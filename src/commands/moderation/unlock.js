const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logsChannel, serverName } = require('../../../config.json');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    // Loop through all text channels and unlock them
    const textChannels = interaction.guild.channels.cache.filter(channel => channel.isTextBased());
    let unlockedChannels = [];

    try {
      // Unlock each text channel
      for (const channel of textChannels.values()) {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SEND_MESSAGES: null,  // Revert back to the default permission (allow sending messages)
        });
        unlockedChannels.push(channel.name);
      }

      // Reply publicly in the channel to confirm the action
      interaction.channel.send(`All text channels have been **unlocked**.`);

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00') // Green color for unlock
          .setTitle('Server Unlocked')
          .addFields(
            { name: 'Action', value: `All text channels unlocked.`, inline: false },
            { name: 'Unlocked By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`There was an error when unlocking the server: ${error}`);
      await interaction.editReply({ content: "I couldn't unlock the server.", ephemeral: true }); // Private error message
    }
  },

  name: 'unlock',
  description: 'Unlocks all text channels in the server.',
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
