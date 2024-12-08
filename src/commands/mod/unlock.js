const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { ModCommand } = require('../../classes/command/modcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

// Multiple messages

module.exports = class UnlockCommand extends ModCommand {
  constructor() {
    let comprops = {
      name: "unlock",
      category: "mod",
      description: "Unlocks a channel, allowing users to send messages again.",
      options: [
        {
          name: "channel",
          description: "The channel to unlock.",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
      // permissionsRequired: [PermissionFlagsBits.ManageChannels],
      // botPermissions: [PermissionFlagsBits.ManageChannels],
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }
  /**
   * Unlocks a specified channel, allowing the @everyone role to send messages.
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction, cmd, options) {
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const channel = options['channel'];

    try {
      if (!this.DEV) {
        // Unlock the channel by allowing SEND_MESSAGES for @everyone
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: null, // Removes the overwrite
        });
      }

      // Send public confirmation in the channel
      const embedProps = {
        color: colors["success"],
        title: { text: '[ModPost] Channel Unlocked!', emoji: '🟡' },
        description: (this.DEV ? "DEV: " : "") + `<#${channel.id}> has been **unlocked**.`,
      }
      const embed = new RookEmbed(embedProps);
      channel.send({ embeds: [embed] });

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(guildChannels["logging"]);
      if (logs && !this.DEV) {
        let props = {
          color: colors["success"],
          title: {
            text: "🔓 [Log] Channel Unlocked"
          },
          fields: [
            { name: 'Channel Unlocked', value: `<#${channel.id}>\n(ID: ${channel.id})`,    inline: true },
            { name: 'Unlocked By',      value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true }
          ]
        }
        const embed = new RookEmbed(props)
        logs.send({ embeds: [ embed ] });
      } else {
        console.log("Logs channel not found.");
      }

      // Complete the interaction with a private success message
      this.props.description = (this.DEV ? "DEV: " : "") + `<#${channel.id}> has been successfully **unlocked**!`
    } catch (error) {
      console.log(`There was an error when unlocking the channel: ${error.stack}`);
      this.error = true
      this.ephemeral = true
      this.props.description = `I couldn't unlock <#${channel.id}>.`
    }
  }
}
