const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { ModCommand } = require('../../classes/command/modcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

module.exports = class WarnCommand extends ModCommand {
  constructor() {
    let comprops = {
      name: "warn",
      category: "mod",
      description: "Warns a user in the server.",
      options: [
        {
          name: "user-id",
          description: "The ID of the user you want to warn.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for warning the user.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      // permissionsRequired: [PermissionFlagsBits.ManageMessages],
      // botPermissions: [PermissionFlagsBits.ManageMessages],
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction) {
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const targetUserInput = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be warned
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      this.error = true
      this.props.description = `User not found (ID: ${targetUserId}).`
      return;
    }

    // Check if the user is in the server (guild)
    const guildMember = interaction.guild.members.cache.get(targetUserId);
    if (!guildMember) {
      this.error = true
      this.props.description = `User is not in the server (ID: ${targetUserId}).`
      return;
    }

    // Attempt to warn the user
    try {
      // Determine the name to display
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the warn
      this.props.color = colors["success"]
      this.props.title = {
        text: "[ModPost] Success!",
        emoji: "🟢"
      }
      this.props.description = [
        (this.DEV ? "DEV: " : "") +
        `User **${targetUserName}** has been **warned**.`,
        `(ID: \`${targetUserId}\`; ${reason})`
      ]

      let props = {
        public: this.props,
        dm: null,
        mod: null,
        log: null
      }
      let embeds = {
        public: new RookEmbed(props.public),
        dm: null,
        mod: null,
        log: null
      }

      if (!this.DEV) {
        // Try to DM the user about the warn (private)
        try {
          props.dm = {
            color: colors["bad"],
            title: {
              text: (this.DEV ? "[DM] " : "") + "Warned"
            },
            description: `⚠️You have been warned in the ${interaction.guild.name} server. (${reason})`
          }
          embeds.dm = new RookEmbed(props.dm)
          await targetUser.send({ embeds: [ embeds.dm ] })

          props.mod = {
            color: colors["success"],
            title: {
              text: "[ModPost] Success!",
              emoji: "🟢"
            },
            description: [
              `✅ User **${targetUserName}** successfully warned via DMs!`,
              "",
              `Message: ${props.dm.description}`
            ]
          }
          embeds.mod = new RookEmbed(props.mod)
          await interaction.followUp(
            {
              embeds: [ embeds.mod ],
              ephemeral: true
            }
          )
        } catch (dmError) {
          console.log(`Failed to DM user: ${dmError.message}`);
          props.mod = {
            color: colors["red"],
            title: {
              text: "Error"
            },
            description: [
              `I couldn't send the DM to the user (ID: ${targetUserId}).`,
              `They might have DMs disabled.`
            ]
          }
          embeds.mod = new RookEmbed(props.mod)
          await interaction.followUp(
            {
              embeds: [ embeds.mod ],
              ephemeral: true
            }
          )
        }
      }

      if (!this.DEV) {
        // Log the action in the logs channel (private)
        const logs = client.channels.cache.get(guildChannels["logging"]);
        if (logs) {
          props.log = {
            color: colors["bad"],
            title: {
              text: "⚠️ [Log] User Warned"
            },
            fields: [
              { name: 'User Warned',  value: `${targetUser}\n(ID: ${targetUserId})`,              inline: true },
              { name: 'Warned By',    value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true },
              { name: 'Reason',       value: reason,                                             inline: false }
            ]
          }
          embeds.log = new RookEmbed(props.log)
          logs.send({ embeds: [ embeds.log ] });
        } else {
          console.log("Logs channel not found.");
        }
      }
    } catch (error) {
      console.log(`There was an error when warning: ${error.stack}`);
      this.error = true
      this.ephemeral = true
      this.description = `I couldn't warn that user (ID: ${targetUserId}).`
    }
  }
}
