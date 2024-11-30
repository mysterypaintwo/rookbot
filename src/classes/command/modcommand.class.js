const { PermissionFlagsBits } = require('discord.js')
const { AdminCommand } = require('./admincommand.class')
const { RookEmbed } = require('../embed/rembed.class')
const colors = require('../../dbs/colors.json')
const path = require('path')
const fs = require('fs')

String.prototype.ucfirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

/**
 * @class
 * @classdesc Build a Command for Mods-only
 * @this {ModCommand}
 * @extends {AdminCommand}
 * @public
 */
class ModCommand extends AdminCommand {
  constructor(comprops, props) {
    if (!comprops?.permissionsRequired) {
      comprops.permissionsRequired = [PermissionFlagsBits.KickMembers]
    }
    if (!comprops?.permissionsRequired) {
      comprops.botPermssions = [PermissionFlagsBits.KickMembers]
    }
    comprops.access = "Mod"

    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction) {
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const targetUserInput = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // EMOJI for the action
    let emoji = ""
    // TENSE for the action
    let tenses = {
      past:     `${this.name}ed`,
      present:  this.name,
      future:   this.name,
      active:   `${this.name}ing`
    }
    switch(this.name) {
      case "ban":
        tenses.past = "banned"
        tenses.active = tenses.past.replace("ed","ing")
        emoji = "🔨"
        break
      case "kick":
        emoji = "👟💥🏃‍♂️"
        break
      case "unban":
        tenses.past = "unbanned"
        tenses.active = tenses.past.replace("ed","ing")
        emoji = "🔨"
        break
      case "warn":
        emoji = "⚠️"
        break
    }

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >
    if(["ban","kick","unban"].includes(this.name)) {
      if(targetUserInput != targetUserId) {
        this.error = true
        this.props.description = [
          `Can't **${this.name}** a mention! Must use user ID!`,
          `ID: \`${targetUserId}\``
        ]
        return
      }
    }

    // Get the user to be banned
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      this.error = true
      this.props.description = "User not found."
      return
    }

    // Get the guild member (to fetch nickname if present)
    const guildMember = interaction.guild.members.cache.get(targetUserId);
    const user = guildMember || targetUser

    // Attempt to ACTION the user
    try {
      // ACTION the user
      if (!this.DEV) {
        switch(this.name) {
          case "ban":
            await interaction.guild.members.ban(targetUserId, { reason })
            break
          case "kick":
            await interaction.guild.members.kick(targetUserId, { reason })
            break
          case "unban":
            await interaction.guild.members.unban(targetUserId)
            break
          case "warn":
            // await interaction.guild.members.warn(targetUserId)
            break
        }
      }

      // Determine the name to display (use nickname if available, otherwise default to tag or username)
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the ACTION
      this.props.color = colors["success"]
      this.props.title = {
        text: "[ModPost] Success!",
        emoji: "🟢"
      }
      this.props.description = [
        (this.DEV ? "DEV: " : "") +
        `User **${targetUserName}** has been **${tenses.past}**.`,
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
        // Try to DM the user about the ACTION (private)
        try {
          props.dm = {
            color: colors["bad"],
            title: {
              text: (this.DEV ? "[DM] " : "") + this.name.ucfirst()
            },
            description: `You have been ${tenses.past} from the ${interaction.guild.name} server. (${reason})`
          }
          embeds.dm = new RookEmbed(props.dm)
          await targetUser.send({ embeds: [ embeds.dm ] })
          console.log(`/${this.name}: DM action`)

          props.mod = {
            color: colors["success"],
            title: {
              text: "[ModPost] Success!",
              emoji: "🟢"
            },
            description: [
              `✅ User **${targetUserName}** successfully ${tenses.past} via DMs!`,
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
          console.log(`/${this.name}: ModPost`)
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

      if (!this.DEV || true) {
        // Log the action in the logs channel (private)
        let log_type = "logging"
        let log_check = `logging-${this.name}`
        if (guildChannels[log_check]) {
          log_type = log_check
        }
        const logs = client.channels.cache.get(guildChannels[log_type]);
        if (logs) {
          if(this.DEV) {
            emoji = "[DEV]" + emoji
          }
          props.log = {
            color: this.name == "unban" ? colors["good"] : colors["bad"],
            title: {
              text: "[Log] User " + tenses.past.ucfirst(),
              emoji: emoji
            },
            fields: [
              { name: 'User ' + tenses.past.ucfirst(),  value: `${targetUser}\n(ID: \`${targetUserId}\`)`,              inline: true },
              { name: tenses.past.ucfirst() + ' By',    value: `${interaction.user}\n(ID: \`${interaction.user.id}\`)`, inline: true }
            ]
          }
          if (["ban","kick","warn"].includes(this.name)) {
            props.log.fields.push(
              {
                name: "Reason",
                value: reason,
                inline: false
              }
            )
          }
          embeds.log = new RookEmbed(props.log)
          logs.send({ embeds: [ embeds.log ] })
          console.log(`/${this.name}: LogPost`)
          let logFilePath = path.join(
            __dirname,
            "..",
            "..",
            "botlogs",
            "member" + this.name.ucfirst() + "s.log"
          )
          let logEntry = [
            `[${new Date().toISOString()}]`,
            `User:    ${user.tag} (ID: ${user.id})`,
            `Guild:   ${interaction.guild.name} (ID: ${interaction.guild.id})`,
            `User ID: ${user.id}`,
            '--------------------------------'
          ].join("\n") + "\n"
          fs.appendFileSync(logFilePath, logEntry, "utf8")
          console.log(`/${this.name}: LogFile`)
        } else {
          console.log("Logs channel not found.")
        }
      }
    } catch (error) {
      console.log(`There was an error when banning: ${error.stack}`)
      this.error = true
      this.ephemeral = true
      this.props.description = `I couldn't ${tenses.present} that user (ID: \`${targetUserId}\`).`
    }
  }
}

exports.ModCommand = ModCommand
