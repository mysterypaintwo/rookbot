const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const { evaluate } = require('mathjs');

module.exports = {
  name: 'calc',
  description: 'Evaluates a math expression.',
  options: [
    {
      name: 'expression',
      description: 'The math expression to evaluate.',
      type: 3, // String
      required: true,
    },
  ],

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  execute: async (client, interaction) => {
    const expression = interaction.options.getString('expression');

    try {
      // Evaluate the math expression
      const result = evaluate(expression);

      // Create and send the embed
      let players = {}
      players["bot"] = {
        name: client.user.displayName,
        avatar: client.user.avatarURL()
      }
      players["user"] = {
        name: interaction.user.displayName,
        avatar: interaction.user.avatarURL(),
        username: interaction.user.username
      }
      let props = {
        title: {
          text: "Calculator"
        },
        fields: [
          { name: "Expression", value: `\`${expression}\``, inline: false },
          { name: "Result",     value: `\`${result}\``,     inline: false }
        ],
        players: players
      }
      const embed = new RookEmbed(props)

      await interaction.reply({ embeds: [ embed ] });
    } catch (error) {
      console.error('Error evaluating expression:', error);

      // Send an error embed if the math expression is invalid
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "Invalid math expression. Please try again."
      }
      const embed = new RookEmbed(props)

      await interaction.reply({ embeds: [ embed ], ephemeral: true });
    }
  }
};
