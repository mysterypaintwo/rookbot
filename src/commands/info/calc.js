const { ApplicationCommandOptionType } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class.js')
const { evaluate } = require('mathjs');

module.exports = class CalcCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "calc",
      description: "Evaluates a math expression",
      options: [
        {
          name: "expression",
          description: "The math expression to evaluate",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    }
    let props = {
      title: {
        text: "Calculator"
      }
    }

    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction) {
    interaction.deferReply()

    const expression = interaction.options.getString('expression');

    try {
      // Evaluate the math expression
      const result = evaluate(expression);

      // Create and send the embed
      this.props.fields = [
        { name: "Expression", value: `\`${expression}\``, inline: false },
        { name: "Result",     value: `\`${result}\``,     inline: false }
      ]
    } catch (error) {
      console.error('Error evaluating expression:', error);

      this.error = true

      // Send an error embed if the math expression is invalid
      this.props.description = "Invalid math expression. Please try again."
    }
    await interaction.deleteReply();
  }
};
