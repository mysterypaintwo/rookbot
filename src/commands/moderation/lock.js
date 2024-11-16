const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logsChannel, serverName } = require('../../../config.json');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const channel = interaction.options.getChannel('channel');

    // Make the initial reply private
    await interaction.deferReply({ ephemeral: true });

    // Attempt to lock the channel
    try {
      // Lock the channel by denying the SEND_MESSAGES permission for @everyone
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SEND_MESSAGES: false,
      });

      // Reply publicly in the channel to confirm the action
      interaction.channel.send(`Channel **${channel.name}** has been **locked**.`);

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(logsChannel);
      if (logs) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000') // Red color for lock
          .setTitle('🔒 Channel Locked')
          .addFields(
            { name: 'Channel Locked', value: `${channel.name}`, inline: true },
            { name: 'Locked By', value: `${interaction.user.displayName} (${interaction.user.tag})`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: `Actioned by ${interaction.user.tag}` });

        logs.send({ embeds: [embed] });
      } else {
        console.log("Logs channel not found.");
      }
    } catch (error) {
      console.log(`There was an error when locking the channel: ${error}`);
      await interaction.editReply({ content: "I couldn't lock the channel.", ephemeral: true }); // Private error message
    }
  },

  name: 'lock',
  description: 'Locks a channel, preventing anyone from sending messages.',
  options: [
    {
      name: 'channel',
      description: 'The channel to lock.',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
