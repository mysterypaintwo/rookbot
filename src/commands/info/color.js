const { RookEmbed } = require('../../classes/embed/rembed.class');

module.exports = {
  name: 'color',
  description: 'Displays information about a hex color code.',
  options: [
    {
      name: 'hex',
      description: 'A hex color code (e.g., #FF5733 or FF5733).',
      type: 3, // String
      required: true,
    },
  ],

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  execute: async (client, interaction) => {
    const hexInput = interaction.options.getString('hex').replace('#', '').toUpperCase();

    // Validate hex string
    const hexRegex = /^[0-9A-F]{6}$/;
    if (!hexRegex.test(hexInput)) {
      let props = {
        color: "#FF0000",
        title: {
          text: "Error"
        },
        description: "Invalid hex color code. Please provide a valid 6-character hexadecimal string (e.g., #FF5733 or FF5733)."
      }
      const embed = new RookEmbed(props)

      await interaction.reply({ embeds: [ embed ], ephemeral: true });
      return;
    }

    // Convert hex to RGB
    const r = parseInt(hexInput.substring(0, 2), 16);
    const g = parseInt(hexInput.substring(2, 4), 16);
    const b = parseInt(hexInput.substring(4, 6), 16);

    // Create the embed
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
      color: `${hexInput}`,
      title: {
        text: "Color Information"
      },
      fields: [
        { name: 'Hex', value: `\`#${hexInput}\``,   inline: true },
        { name: 'RGB', value: `(${r}, ${g}, ${b})`, inline: true },
      ],
      players: players
    }
    const embed = new RookEmbed(props)

    // Send the embed
    await interaction.reply({ embeds: [ embed ] });
  }
};
