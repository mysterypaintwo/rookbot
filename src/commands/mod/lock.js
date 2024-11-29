const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

module.exports = class LockCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "lock",
      category: "mod",
      description: "Locks a channel, preventing anyone from sending messages.",
      options: [
        {
          name: "channel",
          description: "The channel to lock.",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
      permissionsRequired: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }
  /**
   * Locks a specified channel, preventing the @everyone role from sending messages.
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction) {
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const channel = interaction.options.getChannel('channel');

    try {
      if (!this.DEV) {
        // Lock the channel by denying SEND_MESSAGES for @everyone
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: false,
        });
      }

      // Send public confirmation in the channel
      const embedProps = {
        color: colors["bad"],
        title: { text: 'Channel Locked!' },
        description: (this.DEV ? "DEV: " : "") + `<#${channel.id}> has been **locked**.`,
      };
      const embed = new RookEmbed(embedProps);
      channel.send({ embeds: [embed] });

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(guildChannels["logging"]);
      if (logs && !this.DEV) {
        let props = {
          color: colors["bad"],
          title: {
            text: "🔒 Channel Locked"
          },
          fields: [
            { name: 'Channel Locked', value: `<#${channel.id}>\n(ID: ${channel.id})`,    inline: true },
            { name: 'Locked By',      value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true }
          ]
        }
        const embed = new RookEmbed(props)
        logs.send({ embeds: [ embed ] });
      } else {
        console.log("Logs channel not found.");
      }

      // Complete the interaction with a private success message
      this.props.description = (this.DEV ? "DEV: " : "") + `<#${channel.id}> has been successfully **locked**!`
    } catch (error) {
      console.log(`There was an error when locking the channel: ${error.stack}`);
      this.error = true
      this.ephemeral = true
      this.props.description = `I couldn't lock <#${channel.id}>.`
    }
  }
};
