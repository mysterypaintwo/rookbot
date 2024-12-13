const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { ModCommand } = require('../../classes/command/modcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');

module.exports = class LockdownCommand extends ModCommand {
  constructor(client) {
    let comprops = {
      name: "lockdown",
      category: "mod",
      description: "Locks or unlocks all channels for the @everyone role.",
      options: [
        {
          name: "action",
          description: "Specify whether to lock or unlock all channels.",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "Lock", value: "lock" },
            { name: "Unlock", value: "unlock" }
          ]
        },
        {
          name: "confirm",
          description: "Boolean to confirm the action and avoid accidental execution.",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "False", value: "false" },
            { name: "True", value: "true" }
          ]
        }
      ],
      // permissionsRequired: [PermissionFlagsBits.ManageChannels],
      // botPermissions: [PermissionFlagsBits.ManageChannels],
    }
    let props = {}

    super(
      client,
      {...comprops},
      {...props}
    )
  }
  /**
   *
   * @param {RookClient} client
   * @param {Interaction} interaction
   */
  async action(client, interaction, cmd, options) {
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);

    const action = options['action'];
    const confirm = options['confirm'];
    const channels = interaction.guild.channels.cache.filter(
      ch => ch.isTextBased() || ch.isVoiceBased()
    );

    if (!["true"].includes(confirm)) {
      this.error = true
      this.props.description = "Command not confirmed. Please confirm to proceed."
      this.ephemeral = true
      return
    }

    if (!["lock", "unlock"].includes(action)) {
      this.error = true
      this.props.description = "Invalid action. Please use `lock` or `unlock`."
      this.ephemeral = true
      return
    }

    let followUp = (this.DEV ? "DEV: " : "") + `Starting to ${action} all channels. This may take a moment...`
    await interaction.followUp({
      content: followUp,
      ephemeral: true,
    });

    let processedCount = 0;
    let processedChannels = [];
    if(!this.DEV) {
      const channelPromises = channels.map(channel =>
        channel.permissionOverwrites
          .edit(interaction.guild.roles.everyone, {
            SendMessages: action === 'lock' ? false : null,
          })
          .then(() => {
            processedCount++;
            processedChannels.push(channel.id); // Log successful channel IDs
          })
          .catch(error => console.log(`Failed for ${channel.id}: ${error.message}`))
      );

      await Promise.allSettled(channelPromises);

      // Log the action in the logs channel (private)
      const logs = client.channels.cache.get(guildChannels["logging"]);
      if (logs) {
        const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
        const embed = new RookEmbed({
          color: action === 'lock' ? '#FF0000' : '#00FF00',
          title: {
            text: `🔒🔒 [Log] Lockdown \(${capitalizedAction}\)`
          },
          fields: [
            {
              name: `Public Channels ${action}ed`,
              value:
                processedChannels.length > 0
                  ? processedChannels.map(id => `<#${id}>`).join('\n')
                  : 'No channels were processed.',
            },
            {
              name: `Action Performed By`,
              value: `${interaction.user}\n(ID: ${interaction.user.id})`,
              inline: true,
            },
          ]
        });
        logs.send({ embeds: [embed] });
      }
    } else {
      console.log("Logs channel not found.");
    }

    this.props.description = (this.DEV ? "DEV: " : "") + `All channels have been **${action}ed** successfully! (${processedCount}/${channels.size} processed)`
    this.ephemeral = true
  }
}
