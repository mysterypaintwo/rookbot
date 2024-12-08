const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class ProfilePicCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "pfp",
      category: "misc",
      description: "Displays the profile picture of the mentioned user",
      flags: { target: "required" },
      options: [
        {
          name: "target-id",
          description: "The user whose profile picture you want to see",
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

    // Access the server nickname, fallback to username if null
    const targetUserName = targetMember.nickname || targetMember.user.displayName || targetMember.user.tag || targetMember.user.username

    // Get the user's avatar URL
    const avatarURL = targetMember.user.displayAvatarURL({ size: 1024 })

    this.props = {
      caption: {
        text: `${targetUserName}'s Avatar`,
        url: avatarURL
      },
      image: avatarURL
    }

    return !this.error
  }
}
