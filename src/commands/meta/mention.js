const { ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class MentionCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "mention",
      category: "meta",
      description: "Give code to post a mention in chat",
      options: [
        {
          name: "target-id",
          description: "ID of target",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "target-type",
          description: "Mention Type",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "Channel",        value: "channel" },
            { name: "Role",           value: "role" },
            { name: "Text Channel",   value: "channel" },
            { name: "User",           value: "user" },
            { name: "Voice Channel",  value: "channel" }
          ]
        }
      ]
    }
    let props = {
      title: {
        text: "Mention Helper"
      }
    }

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
    let targetInput   = interaction.options.getString("target-id")
    let targetId      = targetInput.replace(/[<#@&!>]/g, '');  // Remove <@>, <@!>, and >
    let targetType    = interaction.options.getString("target-type") || "channel"
    let targetMention = ""

    // console.log(
    //   [
    //     `/mention: Input`,
    //     `Input:    ${targetInput}`,
    //     `ID:       ${targetId}`,
    //     `InType:   ${targetType}`
    //   ].join("\n")
    // )

    for(let [check, mentionType] of Object.entries
      (
        {
          "\@\!": "user",
          "@":    "user",
          "\#\!": "channel",
          "#":    "channel"
        }
      )
    ) {
      if(targetInput.indexOf(check) > -1) {
        targetType = mentionType
      }
    }
    if(targetInput.indexOf("@") > -1 && targetInput.indexOf("&") > -1) {
      targetType = "role"
    }

    // console.log(
    //   `CalcType: ${targetType}`
    // )

    switch(targetType) {
      case "channel":
        targetMention = `<#${targetId}>`
        break
      case "role":
        targetMention = `<@&${targetId}>`
        break
      case "user":
        targetMention = `<@!${targetId}>`
        break
      default:
        targetMention = "Error"
        this.error = true
        this.props.description = `Invalid channel type ['${targetType}']`
        break
    }

    // console.log(
    //   [
    //     `Output:   ${targetMention}`,
    //     ""
    //   ].join("\n")
    // )

    if(!this.error) {
      this.props.fields = [
        {
          name: "Type",
          value: targetType
        },
        {
          name: "ID",
          value: `\`${targetId}\``
        },
        {
          name: "Mention",
          value: targetMention
        },
        {
          name: "Code",
          value: `\`${targetMention}\``
        }
      ]
    }
  }
}
