const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { RookEmbed } = require('../../classes/embed/rembed.class');

module.exports = {
  /**
   * Unlocks a specified channel, allowing the @everyone role to send messages.
   * @param {Client} client
   * @param {Interaction} interaction
   */
  execute: async (client, interaction) => {
    const PROFILE = require('../../PROFILE.json');
    let DEV_MODE = PROFILE["profiles"][PROFILE["selectedprofile"]]?.DEV
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const channel = interaction.options.getChannel('channel');

    // Acknowledge the interaction


    try {
      if (!DEV_MODE) {
        // Unlock the channel by allowing SEND_MESSAGES for @everyone
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: null, // Removes the overwrite
        });
      }

      // Send public confirmation in the channel
      const embedProps = {
        color: '#00FF00',
        title: { text: 'Channel Unlocked!' },
        description: `Channel <#${channel.id}> has been **unlocked**.`,
      };
      const embed = new RookEmbed(embedProps);
      channel.send({ embeds: [embed] });

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(guildChannels["logging"]);
      if (logs) {
        let props = {
          color: "#FF0000",
          title: {
            text: "🔓 Channel Unlocked"
          },
          fields: [
            { name: 'Channel Unlocked', value: `<#${channel.id}>\n(ID: ${channel.id})`,    inline: true },
            { name: 'Unlocked By',      value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true }
          ],
          footer: {
            msg: `Actioned by ${interaction.user.displayName}`
          }
        }
        const embed = new RookEmbed(props)
        logs.send({ embeds: [ embed ] });
      } else {
        console.log("Logs channel not found.");
      }

      // Complete the interaction with a private success message
      await interaction.editReply({
        content: `Channel <#${channel.id}> has been successfully **unlocked**!`,
      });
    } catch (error) {
      console.log(`There was an error when unlocking the channel: ${error.stack}`);
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "I couldn't unlock the channel."
      }
      const embed = new RookEmbed(props)
      await interaction.editReply({ embeds: [ embed ], ephemeral: true }); // Private error message
    }
  },

  name: 'unlock',
  description: 'Unlocks a channel, allowing users to send messages again.',
  options: [
    {
      name: 'channel',
      description: 'The channel to unlock.',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
