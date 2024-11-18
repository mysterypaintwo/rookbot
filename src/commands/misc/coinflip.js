const { RookEmbed } = require("../../classes/embed/rembed.class");

module.exports = {
    name: 'coinflip',
    description: 'Flips a coin and returns either Heads or Tails',

    execute: async (client, interaction) => {
        // Randomly choose between "Heads" and "Tails"
        const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';

        let props = {
          title: {
            text: "Flip a coin!"
          },
          description: `The coin landed on **${outcome}**!`
        }
        const embed = new RookEmbed(props)

        // Respond with the outcome
        await interaction.reply({ embeds: [ embed ] });
    }
  };
