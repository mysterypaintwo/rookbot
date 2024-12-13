const { ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class.js')
const { RookEmbed } = require('../../classes/embed/rembed.class.js')

/**
 * @class
 * @classdesc App Help
 * @this {HelpCommand}
 * @extends {RookCommand}
 * @public
 */
module.exports = class HelpCommand extends RookCommand {
  constructor(client) {
    let comprops = {
      name: "help",
      category: "app",
      description: "Help",
      options: [
        {
          name: "section-name",
          description: "Section Name",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "Application",  value: "app" },
            { name: "Bot",          value: "bot" },
            { name: "Diagnostics",  value: "diagnostic" },
            { name: "Zelda: Dungeons of Infinity", value: "doi" },
            { name: "Fun",          value: "fun" },
            { name: "Information",  value: "info" },
            { name: "Meta",         value: "meta" },
            { name: "Miscellaneous",value: "misc" },
            { name: "Moderation",   value: "mod" },
            { name: "Randomizers",  value: "rando" },
            { name: "Unsorted",     value: "undefined" }
          ]
        },
        {
          name: "command-name",
          description: "Command Name",
          type: ApplicationCommandOptionType.String
        }
      ],
      testOptions: [
        {},
        { "section-name": "app" },
        { "command-name": "diceroll" },
        { "section-name": "moo", "assert": false },
        { "command-name": "moo", "assert": false }
      ]
    }
    let props = {
      caption: { text: "Help", emoji: "?" }
    }
    super(
      client,
      {...comprops},
      {...props}
    )
  }
  async action(client, interaction, cmd, options) {
    let helpJSON = require('../../res/app/manifests/help/help.json')
    let command = options["command-name"] ?? null
    let section = options["section-name"] ?? null

    this.props.description = ""

    if(command) {
      for(let [sectionName, sectionCmds] of Object.entries(helpJSON)) {
        if(command in sectionCmds) {
          let thisJSON = {}
          thisJSON[sectionName] = {}
          thisJSON[sectionName][command] = sectionCmds[command]
          helpJSON = thisJSON
        }
      }
    } else if(section) {
      let thisJSON = {}
      thisJSON[section] = helpJSON[section]
      helpJSON = thisJSON
    }

    for(let [sectionName, sectionCmds] of Object.entries(helpJSON)) {
      for(let [cmdName, cmd] of Object.entries(sectionCmds)) {
        let props = {
          title: { text: `Help - ${sectionName} - ${cmdName}` },
          description: "** **",
          fields: [
            {
              name: "Name",
              value: `\`/${cmd.name}\``,
              inline: true
            },
            {
              name: "Category",
              value: `\`${cmd.category}\``,
              inline: true
            },
            {
              name: "Description",
              value: cmd.description || "** **",
              inline: false
            }
          ]
        }
        if (cmd?.access && cmd.access.toLowerCase() != "unset") {
          props.fields.push(
            {
              name: "Access",
              value: cmd.access,
              inline: false
            }
          )
        }
        if(cmd?.options && cmd.options.length > 0) {
          for(let [optionID, option] of Object.entries(cmd.options)) {
            if (option && option?.name) {
              let optionName = `Option: \`${option.name}\``
              if (option?.required && option.required) {
                optionName += " - *required*"
              }
              props.fields.push(
                {
                  name: optionName,
                  value: option.description || "** **",
                  inline: false
                }
              )
            }
          }
        }
        let this_page = new RookEmbed(client, props)
        this_page.init(client, props)
        await this.pages.push(this_page)
      }
    }

    return this.pages.length > 0 && !this.error
  }
}
