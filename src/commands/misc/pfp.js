const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class ProfilePicCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "pfp",
      category: "misc",
      description: "Displays the profile picture of the mentioned user",
      options: [
        {
          name: "target-user",
          description: "The user whose profile picture you want to see",
          type: ApplicationCommandOptionType.String,
          required: true
        }
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
  async action(client, interaction) {
    const targetUserInput = interaction.options.get('target-user').value

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '')  // Remove <@>, <@!>, and >

    // Fetch the GuildMember object to access server-specific info
    const targetMember = await interaction.guild.members.fetch(targetUserId)

    // Access the server nickname, fallback to username if null
    const targetUserName = targetMember.nickname || targetMember.user.displayName || targetMember.user.tag || targetMember.user.username

    // Get the user's avatar URL
    const avatarURL = targetMember.user.displayAvatarURL({ size: 1024 })

    this.props = {
      title: {
        text: `${targetUserName}'s Avatar`,
        url: avatarURL
      },
      image: avatarURL
    }
  }
}
