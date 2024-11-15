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

    // Loop through all text channels and lock them
    const textChannels = interaction.guild.channels.cache.filter(channel => channel.isTextBased());
    let lockedChannels = [];

    try {
      // Lock each text channel
      for (const channel of textChannels.values()) {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SEND_MESSAGES: false,
        });
        lockedChannels.push(channel.name);
      }

      // Reply publicly in the channel to confirm the action
      interaction.channel.send(`All text channels have been **locked**.`);

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000') // Red color for lockdown
          .setTitle('Server Locked Down')
          .addFields(
            { name: 'Action', value: `All text channels locked.`, inline: false },
            { name: 'Locked By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`There was an error when locking down: ${error}`);
      await interaction.editReply({ content: "I couldn't lock down the server.", ephemeral: true }); // Private error message
    }
  },

  name: 'lockdown',
  description: 'Locks all text channels in the server.',
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
