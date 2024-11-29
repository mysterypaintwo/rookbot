const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class ProfilePicCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "pfp",
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


    // Get the user mentioned in the command
    const targetUserId = interaction.options.get('target-user').value;

    // Fetch the GuildMember object to access server-specific info
    const targetMember = await interaction.guild.members.fetch(targetUserId);

    // Access the server nickname, fallback to username if null
    const targetUserName = targetMember.nickname || targetMember.user.displayName || targetMember.user.tag || targetMember.user.username;

    // Get the user's avatar URL
    const avatarURL = targetMember.user.displayAvatarURL({ size: 1024 });

    this.props = {
      title: {
        text: `${targetUserName}'s Avatar`,
        url: avatarURL
      },
      image: avatarURL
    }


  }
};
