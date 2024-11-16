module.exports = {
    name: 'coinflip',
    description: 'Flips a coin and returns either Heads or Tails',
  
    execute: async (client, interaction) => {
        // Randomly choose between "Heads" and "Tails"
        const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';

        // Respond with the outcome
        await interaction.reply(`🪙 The coin landed on **${outcome}**!`);
    },
  };