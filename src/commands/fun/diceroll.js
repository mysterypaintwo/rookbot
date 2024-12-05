const { ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class')

module.exports = class DiceRollCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "diceroll",
      category: "fun",
      description: "Rolls a specified number of dice with a specified number of sides",
      options: [
        {
          name: "count",
          description: "Number of dice to roll (1-10)",
          type: ApplicationCommandOptionType.Integer,
          min_value: 1,
          max_value: 10,
          required: true
        },
        {
          name: "sides",
          description: "Number of sides on each die (2-9999)",
          type: ApplicationCommandOptionType.Integer,
          min_value: 2,
          max_value: 9999
        }
      ]
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }

    async action(client, interaction, args, cmd, options) {
      const count = options.count
      const sides = options.sides ?? 6

      // Roll the dice and collect results
      const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1)
      let total = 0
      for (let roll of rolls) {
        total += roll
      }

      this.props = {
        title: {
          text: `Roll ${count}d${sides}!`
        },
        description: `🎲You got ${rolls.join(', ')} for a total of ${total}`
      }
    }

    async test(client, interaction, args, cmd, options) {
      let tests = [
        { count: 4, sides: 6 },
        { count: 5, sides: 6 }
      ]
      for (let thisTest of tests) {
        this.execute(client, interaction, args, cmd, thisTest)
      }
    }
  }
