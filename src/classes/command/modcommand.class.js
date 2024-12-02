const { MessageFlags, PermissionFlagsBits } = require('discord.js')
const { AdminCommand } = require('./admincommand.class')
const { RookEmbed } = require('../embed/rembed.class')
const colors = require('../../dbs/colors.json')
const path = require('path')
const fs = require('fs')

String.prototype.ucfirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

// Multiple messages

/**
 * @class
 * @classdesc Build a Command for Mods-only
 * @this {ModCommand}
 * @extends {AdminCommand}
 * @public
 */
class ModCommand extends AdminCommand {
  constructor(comprops, props) {
    // If we don't have UserPermissions defined
    if (!comprops?.permissionsRequired) {
      // Default to KickMembers
      comprops.permissionsRequired = [PermissionFlagsBits.KickMembers]
    }
    // If we don't have BotPermissions defined
    if (!comprops?.botPermssions) {
      // Default to KickMembers
      comprops.botPermssions = [PermissionFlagsBits.KickMembers]
    }
    // Category: Mod
    comprops.access = comprops?.access ? comprops.access : "Mod"

    // Create parent object
    super(
      {...comprops},
      {...props}
    )
  }

  // Apply Voice Roles (un/mute) to User
  async voice_user(message, user, voice) {
    // Member Role Name
    let MEMBER_ROLE = this?.ROLES?.member ? this.ROLES.member[0]  : null
    // Muted Role Name
    let MUTED_ROLE  = this?.ROLES?.muted  ? this.ROLES.muted[0]   : null

    // Member Role ID
    let MEMBER_ID   = message.options.getString("target-id")  || null
    // Muted Role ID
    let MUTED_ID    = message.options.getString("muted-role-id")   || null

    // If we don't have a user
    if (!user) {
      this.error = true
      this.props.description = "No member loaded."
      return
    }
    // If we don't have a Member Role
    if (!MEMBER_ROLE && !MEMBER_ID) {
      this.error = true
      this.props.description = "No Member Role found in definition file or sent."
      return
    }
    // If we don't have a Muted Role
    if (!MUTED_ROLE && !MUTED_ID) {
      this.error = true
      this.props.description = "No Muted Role found in definition file or sent."
      return
    }

    if (!this.DEV) {
      let mainRoleID = null // Main Role ID
      let muteRoleID = null // Mute Role ID

      // Get Member Role ID
      if (MEMBER_ROLE) {
        mainRoleID = await message.guild.roles.cache.find(role => role.name === MEMBER_ROLE).id
      }
      // Get Muted Role ID
      if (MUTED_ROLE) {
        muteRoleID = await message.guild.roles.cache.find(role => role.name === MUTED_ROLE).id
      }
      // Verify Member Role ID
      if (MEMBER_ID) {
        mainRoleID = await message.guild.roles.cache.find(role => role.id === MEMBER_ID).id
      }
      // Verify Muted Role ID
      if (MUTED_ID) {
        muteRoleID = await message.guild.roles.cache.find(role => role.id === MUTED_ID).id
      }

      // If still no Member Role ID
      if (!mainRoleID) {
        this.error = true
        this.props.description = `${MEMBER_ROLE} Member Role not found in server.`
        return
      }
      // If still no Muted Role ID
      if (!muteRoleID) {
        this.error = true
        this.props.description = `${MUTED_ROLE} Muted Role not found in server.`
        return
      }

      // Get Role ID to remove
      let removeRole = 0
      // Get Role ID to add
      let addRole = 0
      // If muting
      if (voice == "mute") {
        // Remove Member
        // Add    Muted
        removeRole  = mainRoleID
        addRole     = muteRoleID
      } else if (voice == "unmute") {
        // If unmuting
        // Remove Muted
        // Add    Member
        removeRole  = muteRoleID
        addRole     = mainRoleID
      }
      // Remove Role
      user.roles.remove(removeRole)
      // Add Role
      user.roles.add(addRole)
      this.props.description = `<@${user.id}> has been ${voice}d`
    } else {
      this.props.description = `<@${user.id}> *would be* **${voice}d** if this wasn't in DEV Mode`
    }
  }
  async mute_user(message, user, reason) {
    await this.voice_user(message, user, "mute", reason)
  }
  async unmute_user(message, user, reason) {
    await this.voice_user(message, user, "unmute", reason)
  }

  async action(client, interaction) {
    // Get Guild ID
    const guildID = interaction.guild.id;
    // Get Guild Channels
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    // Get User Input
    const targetUserInput = interaction.options.get('user-id').value;
    // Get Reason
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    let props = {
      public: {},
      dm:     {},
      mod:    {},
      log:    {}
    }
    let embeds = {
      public: null,
      dm:     null,
      mod:    null,
      log:    null
    }

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
      case "mute":
        tenses.past = "muted"
        tenses.active = tenses.past.replace("ed","ing")
        emoji = "🔈"
        break
      case "unban":
        tenses.past = "unbanned"
        tenses.active = tenses.past.replace("ed","ing")
        emoji = "🪃"
        break
      case "unmute":
        tenses.past = "unmuted"
        tenses.active = tenses.past.replace("ed","ing")
        emoji = "🔊"
        break
      case "warn":
        emoji = "⚠️"
        break
    }

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >
    if(
      [
        "ban",
        "kick",
        "mute",
        "unban",
        "unmute"
      ].includes(this.name)
    ) {
      if(targetUserInput != targetUserId) {
        props.mod.error = true
        props.mod.ephemeral = true
        props.mod.description = [
          `Can't **${this.name}** a mention! Must use user ID!`,
          `ID: \`${targetUserId}\``
        ]
        this.props = props.mod
        return
      }
    }

    // Get the user to be ACTIONed
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      props.mod.error = true
      props.mod.description = "User not found."
      this.props = props.mod
      return
    }

    // Get the guild member (to fetch nickname if present)
    const guildMember = interaction.guild.members.cache.get(targetUserId);
    const user = guildMember?.user || targetUser

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
          case "mute":
            this.mute_user(interaction, guildMember, reason)
            break
          case "unban":
            await interaction.guild.members.unban(targetUserId)
            break
          case "unmute":
            this.unmute_user(interaction, guildMember, reason)
            break
          case "warn":
            // await interaction.guild.members.warn(targetUserId)
            break
        }
      }

      // Determine the name to display (use nickname if available, otherwise default to tag or username)
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Public ModPost for ACTION
      props.public.color = colors["success"]
      props.public.title = {
        emoji: "🟢",
        text: "[ModPost] Success!"
      }
      props.public.description = [
        (this.DEV ? "DEV: " : "") +
        `User **${targetUserName}** has been **${tenses.past}**.`,
        "(" +
        // `ID: \`${targetUserId}\`; ` +  // Don't add userID to ModPost
        reason +
        ")"
      ]
      embeds.public = new RookEmbed(props.public)
      interaction.editReply(
        {
          embeds: [ embeds.public ]
        }
      )
      this.null = true
      this.props.null = true
      console.log(`/${this.name}: ModPost`)

      if (!this.DEV) {
        // DM post for ACTION
        try {
          let dm_desc = `You have been ${tenses.past} from the ${interaction.guild.name} server. (${reason})`
          if (
            [
              "mute",
              "unmute",
              "warn"
            ].includes(this.name)
          ) {
            dm_desc = dm_desc.replace(" from ", " by staff in ")
          }
          props.dm = {
            color: colors["bad"],
            title: {
              emoji: "⚠️",
              text: (this.DEV ? "[DM] " : "") + this.name.ucfirst()
            },
            description: dm_desc
          }
          embeds.dm = new RookEmbed(props.dm)
          await targetUser.send(
            {
              embeds: [ embeds.dm ]
            }
          )
          console.log(`/${this.name}: DM Post`)

          // Reply to Mod for DM about ACTION
          props.mod = {
            color: colors["success"],
            title: {
              emoji: "🟢",
              text: "Success!"
            },
            description: [
              `✅ User **${targetUserName}** successfully ${tenses.past} via DMs!`,
              "",
              `Message: ${props.dm.description}`
            ],
            ephemeral: true
          }
          embeds.mod = new RookEmbed(props.mod)
          interaction.followUp(
            {
              embeds: [ embeds.mod ],
              flags: MessageFlags.Ephemeral
            }
          )
          console.log(`/${this.name}: YouPost`)
        } catch (dmError) {
          // Reply to Mod about failed DM for ACTION
          console.log(`Failed to DM user: ${dmError.message}`);
          props.mod = {
            color: colors["red"],
            title: { text: "Error" },
            description: [
              `I couldn't send the DM to the user (ID: ${targetUserId}).`,
              `They might have DMs disabled.`
            ],
            ephemeral: true
          }
          embeds.mod = new RookEmbed(props.mod)
          interaction.followUp(
            {
              embeds: [ embeds.mod ],
              flags: MessageFlags.Ephemeral
            }
          )
        }
      }

      if (!this.DEV || true) {
        // LogPost for ACTION
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
              emoji: emoji,
              text: "[Log] User " + tenses.past.ucfirst()
            },
            fields: [
              { name: 'User ' + tenses.past.ucfirst(),  value: `${targetUser}\n(ID: \`${targetUserId}\`)`,              inline: true },
              { name: tenses.past.ucfirst() + ' By',    value: `${interaction.user}\n(ID: \`${interaction.user.id}\`)`, inline: true }
            ]
          }
          if (
            [
              "ban",
              "kick",
              "mute",
              "warn"
            ].includes(this.name)
          ) {
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
        } else {
          console.log("Logs channel not found.")
        }

        // LogFile for ACTION
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
          `Action:  ${tenses.past.ucfirst()}`,
          `Guild:   ${interaction.guild.name} (ID: ${interaction.guild.id})`,
          `Reason:  ${reason}`,
          '--------------------------------'
        ].join("\n") + "\n"
        fs.appendFileSync(logFilePath, logEntry, "utf8")
        console.log(`/${this.name}: LogFile`)
      }
    } catch (error) {
      // Reply to Mod if error for ACTION
      console.log(`There was an error when ${tenses.active}: ${error.stack}`)
      props.mod.error = true
      props.mod.ephemeral = true
      props.mod.description = `I couldn't ${tenses.present} that user (ID: \`${targetUserId}\`).`
      embeds.mod = new RookEmbed(props.mod)
      interaction.followUp(
        {
          embeds: [ embeds.mod ],
          flags: MessageFlags.Ephemeral
        }
      )
    }
  }

  async build(client, message, cmd) {
    // Get list of roles
    this.ROLES = JSON.parse(fs.readFileSync(`./src/dbs/${message.guild.id}/roles.json`, "utf8"))
    // Get Mod roles
    let APPROVED_ROLES = this.ROLES["admin"].concat(this.ROLES["mod"])
    // Bail if we don't have intended Approved Roles data
    if (!APPROVED_ROLES) {
      this.error = true
      this.props.description = "Failed to get Approved Roles."
      return
    }

    // Bail if member doesn't have Approved Roles
    if (!(await message.member.roles.cache.some(r => APPROVED_ROLES.includes(r.name)))) {
      this.error = true
      this.props.description = this.errors.modOnly
      this.props.fields = []
      this.props.footer = {}
      this.props.image = ""
      return
    }

    this.action(client, message, cmd)
  }
}

exports.ModCommand = ModCommand
