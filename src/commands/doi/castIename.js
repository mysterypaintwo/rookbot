const { RookCommand } = require('../../classes/command/rcommand.class');
const { changeNickname } = require('../../utils/changeNickname');  // Import the changeNickname function

module.exports = class CastleNameCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "castlename",
      description: "Immediately triggers a nickname change for castle, to a random castle-esque name",
      // permissionsRequired: [],
      botPermissions: ["MANAGE_NICKNAMES"]
    }
    let props = {}
    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction) {
    // Ensure the command is properly deferred and acknowledged with ephemeral response


    // Get this Guild ID
    // Set Castle's User ID
    // Set DoI Guild ID
    // Determine if we're in DoI
    const guildID = interaction.guild.id;
    const userID = "1111517386588307536";
    const doiGuildID = "1282788953052676177";
    const isDoI = interaction.guild.id === parseInt(doiGuildID);

    try {
      // Get this guild
      const guild = await client.guilds.fetch(guildID);
      if (!guild) {
        this.error = true
        this.props.description = `Guild not found [${guildID}]`
      }

      // Find Castle
      const member = await guild.members.fetch(userID, { force: true }).catch(err => {
        this.error = true
        this.props.description = `Fetch error [${userID}]: ${err}`
      });

      // Couldn't find Castle
      if (!member || !member.user) {
        this.error = true
        this.props.description = "Member not found or invalid data"
        throw new Error("Member not found or invalid data.");
      }

      // Call the utility function to change the nickname
      const result = await changeNickname(client, member, isDoI);

      if (result.success) {
        this.props.players.target = {
          name: member.user.displayName,
          avatar: member.user.avatarURL()
        }
        this.props.title = { text: "Nickname Changed" }
        this.props.description = result.message
        console.log(result.message);
      } else {
        this.error = true
        this.props.description = result.message
      }
    } catch (error) {
      this.error = true
      this.props.description = "There was an error changing the nickname"
      console.error("Error changing nickname:", error);
    }


  }
};
