const { PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js')
const { ModCommand } = require('../../classes/command/modcommand.class')
const path = require('path')
const fs = require('fs')
const { RookEmbed } = require('../../classes/embed/rembed.class')

module.exports = class SearchCommand extends ModCommand {
  constructor() {
    let comprops = {
      name: "search",
      category: "mod",
      description: "Search Logs",
      options: [
        {
          name: "search-type",
          description: "Search Type",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "Membership", value: "Change"},
            { name: "Bans",       value: "Ban" },
            { name: "Unbans",     value: "Unban" },
            { name: "Warns",      value: "Warn" }
          ]
        },
        {
          name: "target-id",
          description: "User ID to search for",
          type: ApplicationCommandOptionType.String,
          required: true
        }
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

  async action(client, interaction) {
    let searchType = interaction.options.getString("search-type")
    let targetUserInput = interaction.options.getString("target-id")
    let targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >
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

    let logFilePath = path.join(
      __dirname,
      "..",
      "..",
      "botlogs",
      "member" + searchType + "s.log"
    )
    let logFile = fs.readFileSync(logFilePath, "utf8")
    let logLines = logFile.split("\n")
    let foundLogs = {}
    let i = 0
    for(let line of logLines) {
      line = line.trim()
      if(line.indexOf(targetUserId) > -1) {
        let beginning = i
        let running = true
        while(running) {
          if(logLines[beginning].indexOf("[") > -1) {
            running = false
          } else {
            beginning = beginning - 1
          }
        }
        running = true
        let end = beginning + 1
        while(running) {
          if(
            (logLines[end].indexOf("[") > -1) ||
            (logLines[end].substring(0,3) == "---") ||
            (logLines[end].trim() == "")
          ) {
            running = false
          } else {
            end = end + 1
          }
        }
        let foundLog = logLines.slice(beginning, end)
        foundLogs[foundLog[0]] = foundLog
      }
      i = i + 1
    }
    i = 1
    for(let [timestamp, foundLog] of Object.entries(foundLogs)) {
      let this_props = {
        title: { text: `Searching ${searchType}s` },
        description: `**User**\n${user}`,
        fields: [],
        timestamp: timestamp
      }
      for(let logLine of foundLog) {
        logLine = logLine.trim()
        if(logLine.indexOf(": ") > -1) {
          let field_name = logLine.substring(0, logLine.indexOf(": "))
          let field_value = logLine.substring(logLine.indexOf(": ") + ": ".length)
          field_value = field_value.replace(/([\d]{5,})/, "`$1`")
          this_props.fields.push(
            {
              name: field_name,
              value: field_value
            }
          )
        } else if(logLine.indexOf("Z]") > -1) {
          this_props.fields.push(
            {
              name: "Time",
              value: logLine
            }
          )
        }
      }
      this.pages.push(new RookEmbed(this_props))
      i = i +1
    }
  }
}