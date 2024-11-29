const { ApplicationCommandOptionType } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class');

module.exports = class ColorCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "color",
      description: "Displays information about a hex color code",
      options: [
        {
          name: "hex",
          description: "A hex color code (e.g., #FF5733 or FF5733)",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction) {
    const hexInput = interaction.options.getString('hex').replace('#', '').toUpperCase();

    // Validate hex string
    const hexRegex = /^[0-9A-F]{6}$/;
    if (!hexRegex.test(hexInput)) {
      this.error = true
      this.props.description = "Invalid hex color code. Please provide a valid 6-character hexadecimal string (e.g., #FF5733 or FF5733)."
      return
    }

    // Convert hex to RGB
    const r = parseInt(hexInput.substring(0, 2), 16);
    const g = parseInt(hexInput.substring(2, 4), 16);
    const b = parseInt(hexInput.substring(4, 6), 16);

    // Create the embed
    this.props = {
      color: `${hexInput}`,
      title: {
        text: "Color Information"
      },
      fields: [
        { name: 'Hex', value: `\`#${hexInput}\``,   inline: true },
        { name: 'RGB', value: `(${r}, ${g}, ${b})`, inline: true },
      ]
    }
  }
};
