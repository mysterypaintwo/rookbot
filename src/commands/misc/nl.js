const { RookCommand } = require('../../classes/command/rcommand.class')

module.exports = class NLCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "nl",
      category: "misc",
      description: "Posts a rainbow divider line"
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }

  async execute(client, interaction) {
    interaction.deferReply()
    try {
      // Create the embed with the rainbow divider line image
      interaction.channel.send(
        {
          content: "https://cdn.discordapp.com/attachments/565312923271168000/985473102702071838/divider-line.gif"
        }
      )

      // Optionally end the interaction without a visible message
    } catch (error) {
      console.error('Error handling /nl command:', error);

      let props = []
      props.description = "An error occurred while posting the rainbow line. Pleas try again later."
      interaction.channel.send(
        { embeds: [new RookEmbed(props)] }
      )
    }
    interaction.deleteReply()
  }
};
