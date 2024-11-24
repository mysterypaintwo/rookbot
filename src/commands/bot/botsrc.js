const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class BotSourceCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "botsrc",
      category: "bot",
      description: "Links to the GitHub repository of rookbot"
    }
    let props = {
      title: {
        text: "rookbot GitHub Repository",
        url: "https://github.com/mysterypaintwo/rookbot"
      },
      description: "Want to see how rookbot works? Check out its [source code](https://github.com/mysterypaintwo/rookbot) on GitHub!",
      fields: [
        {
          name: 'rookbot on GitHub',
          value: 'Explore the [source code](https://github.com/mysterypaintwo/rookbot), contribute, or learn more about how rookbot operates. Feel free to fork, report issues, or submit pull requests!'
        }
      ],
      image: "https://github.com/fluidicon.png"
    }
    super(
      {...comprops},
      {...props}
    )
  }

  /**
   * Sends an embed message with a link to the bot\'s GitHub repository.
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction) {
    // Acknowledge the interaction
    await interaction.deferReply();

    // all done in constructor

    await interaction.deleteReply();
  }
};
