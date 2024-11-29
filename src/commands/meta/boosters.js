const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class BoostersCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "boosters",
      description: "Displays the number of boosters and the server boost level"
    }
    let props = {
      title: {
        text: "Server Boost Info"
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
    // Defer the reply to give the bot time to process the request


    try {
      // Get the number of boosts in the server
      const boosts = interaction.guild.premiumSubscriptionCount;

      // Get the server's boost level
      const boostLevel = interaction.guild.premiumTier;

      // Prepare a message to show the boost information
      this.props.fields = [
        {
          name: "Boosters",
          value: boosts + ""
        },
        {
          name: "Level",
          value: boostLevel + ""
        }
      ]
    } catch(error) {
      console.log(`Error fetching boost info: ${error.stack}`);
      this.error = true
      this.props.description = "There was an error fetching the server's boost information."
    }


  }
};
