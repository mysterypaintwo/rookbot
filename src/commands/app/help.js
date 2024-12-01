const { ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class.js')
const { RookEmbed } = require('../../classes/embed/rembed.class.js')

module.exports = class HelpCommand extends RookCommand {
  constructor() {
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
      ]
    }
    let props = {
      caption: { text: "Help", emoji: "?" }
    }
    super(
      {...comprops},
      {...props}
    )
  }
  async action(client, interaction) {
    let helpJSON = require('../../res/app/manifests/help/help.json')
    let command = interaction.options.getString("command-name") ?? null
    let section = interaction.options.getString("section-name") ?? null

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
          title: { text: `Help - ${cmd.name}` },
          description: "",
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
              value: cmd.description,
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
                  value: option.description,
                  inline: false
                }
              )
            }
          }
        }
        // console.log(props.fields)
        this.pages.push(
          new RookEmbed(props)
        )
      }
    }
  }
}
