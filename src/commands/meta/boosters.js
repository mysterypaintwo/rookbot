const { RookCommand } = require('../../classes/command/rcommand.class.js')

module.exports = class BoostersCommand extends RookCommand {
  constructor(client) {
    let comprops = {
      name: "boosters",
      category: "meta",
      description: "Displays the number of boosters and the server boost level",
      flags: {
        test: "basic"
      }
    }
    let props = {
      title: {
        text: "Server Boost Info"
      }
    }

    super(
      client,
      {...comprops},
      {...props}
    )
  }

  /**
   *
   * @param {RookClient} client
   * @param {Interaction} interaction
   */
  async action(client, interaction, cmd, options) {
    try {
      // Get the number of boosts in the server
      const boosts = interaction.guild.premiumSubscriptionCount

      // Get the server's boost level
      const boostLevel = interaction.guild.premiumTier

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
      console.log(`Error fetching boost info: ${error.stack}`)
      this.error = true
      this.props.description = "There was an error fetching the server's boost information."
    }

    return !this.error
  }
}
