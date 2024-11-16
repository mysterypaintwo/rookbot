const { Client, Intents, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'diceroll',
    description: 'Rolls a specified number of dice with a specified number of sides',
    options: [
        {
            name: 'sides',
            description: 'Number of sides on each die (2-9999)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 2,
            max_value: 9999,
        },
        {
            name: 'count',
            description: 'Number of dice to roll (1-10)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 1,
            max_value: 10,
        }
    ],

    execute: async (client, interaction) => {
        const sides = interaction.options.getInteger('sides');
        const count = interaction.options.getInteger('count');
        
        // Roll the dice and collect results
        const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);

        // Respond with the result
        await interaction.reply(`🎲 You rolled ${count}, ${sides}-sided dice: ${rolls.join(', ')}`);
    },
  };