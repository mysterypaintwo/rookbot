const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class UserInfoCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "userinfo",
      category: "misc",
      description: "Displays data of the mentioned user",
      flags: { target: "required" },
      options: [
        {
          name: "target-id",
          description: "The user you want to see",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
      testOptions: [
        { "target-id": "263968998645956608" },
        { "target-id": "1111517386588307536" },
        { "target-id": "1307416505171968011" },
        { "target-id": "942642507488034841" }
      ]
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction, cmd, options) {
    const targetUserInput = options['target-id']

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '')  // Remove <@>, <@!>, and >

    // Fetch the GuildMember object to access server-specific info
    const targetMember = await interaction.guild.members.fetch(targetUserId)

    // Access the server nickname, fallback to username
    const targetUserName = targetMember.displayName ||
      targetMember.user.tag ||
      targetMember.user.username

    // Get the user's avatar URL
    const avatarURL = targetMember.displayAvatarURL({ size: 1024 })

    let fields = []
    // Username
    fields.push(
      {
        name: "Username",
        value: `\`${targetMember.user.tag}\`` +
        "(ID: " + `\`${targetMember.id}\`` + ")"
      }
    )

    // Created
    fields.push(
      {
        name: "Created",
        value: `<t:${Math.round(targetMember.user.createdTimestamp / 1000)}:f>`
      }
    )

    // Joined
    fields.push(
      {
        name: "Joined",
        value: `<t:${Math.round(targetMember.joinedTimestamp / 1000)}:f>`
      }
    )

    let botActions = {
      "🤖": targetMember.user.bot,
      "🛠": targetMember.manageable,
      "🔨": targetMember.moderatable
    }
    let botCan = ""
    let botCant = ""
    for (let botAction of Object.entries(botActions)) {
      if (botAction[1]) {
        botCan += botAction[0]
      } else {
        botCant += botAction[0]
      }
    }

    fields.push(
      {
        name: "Bot Actions",
        value: "🟩" + botCan + "\n" +
          "🟥" + botCant
      }
    )

    this.props = {
      caption: {
        text: targetUserName,
        url: avatarURL
      },
      color: targetMember.user.hexAccentColor,
      fields: fields,
      image: avatarURL
    }

    return !this.error
  }
}
