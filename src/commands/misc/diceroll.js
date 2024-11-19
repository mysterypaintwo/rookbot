const { Client, Intents, ApplicationCommandOptionType } = require('discord.js');
const { RookEmbed } = require('../../classes/embed/rembed.class');

module.exports = {
    name: 'diceroll',
    description: 'Rolls a specified number of dice with a specified number of sides',
    options: [
        {
            name: 'count',
            description: 'Number of dice to roll (1-10)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 1,
            max_value: 10,
        },
        {
            name: 'sides',
            description: 'Number of sides on each die (2-9999)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 2,
            max_value: 9999,
        }
    ],

    execute: async (client, interaction) => {
        const sides = interaction.options.getInteger('sides');
        const count = interaction.options.getInteger('count');

        // Roll the dice and collect results
        const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
        let total = 0;
        for (let roll of rolls) {
          total += roll;
        }

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
            text: `Roll ${count}d${sides}!`
          },
          description: `🎲You got ${rolls.join(', ')} for a total of ${total}`,
          players: players
        }
        const embed = new RookEmbed(props)

        // Respond with the result
        await interaction.reply({ embeds: [ embed ] });
    }
  };
