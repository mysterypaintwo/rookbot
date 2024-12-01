const { RookCommand } = require("../../classes/command/rcommand.class")

module.exports = class CoinFlipCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "coinflip",
      category: "fun",
      description: "Flips a coin and return either Heads or Tails"
    }
    let props = {
      title: {
        text: "Flip a coin!"
      }
    }

    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction) {
    // Randomly choose between "Heads" and "Tails"
    const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails'

    this.props.description = `The coin landed on **${outcome}**!`
  }
}
