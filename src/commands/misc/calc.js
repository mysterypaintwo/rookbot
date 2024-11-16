const { EmbedBuilder } = require('discord.js');
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
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Calculator')
        .addFields(
          { name: 'Expression', value: `\`${expression}\``, inline: false },
          { name: 'Result', value: `\`${result}\``, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error evaluating expression:', error);

      // Send an error embed if the math expression is invalid
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('Invalid math expression. Please try again.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
