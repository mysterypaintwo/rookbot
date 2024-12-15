const { ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class')

module.exports = class ColorCommand extends RookCommand {
  constructor(client) {
    let comprops = {
      name: "color",
      category: "info",
      description: "Displays information about a hex color code",
      options: [
        {
          name: "hex",
          description: "A hex color code (e.g., #FF5733 or FF5733)",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
      testOptions: [
        { hex: "FFAF00" },
        { hex: "c8a0c8" },
        { hex: "#FFAF00" },
        { hex: "#c8a0c8" }
      ]
    }
    let props = {}

    super(
      client,
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction, options) {
    const hexInput = options.hex.replace('#', '').toUpperCase()

    // Validate hex string
    const hexRegex = /^[0-9A-F]{6}$/
    if (!hexRegex.test(hexInput)) {
      this.error = true
      this.props.description = "Invalid hex color code. Please provide a valid 6-character hexadecimal string (e.g., #FF5733 or FF5733)."
      return
    }

    // Convert hex to RGB
    const r = parseInt(hexInput.substring(0, 2), 16)
    const g = parseInt(hexInput.substring(2, 4), 16)
    const b = parseInt(hexInput.substring(4, 6), 16)
    let dims = "50x50"

    // Create the embed
    this.props = {
      color: `${hexInput}`,
      title: {
        text: "Color Information"
      },
      image: `https://png-pixel.com/${dims}-${hexInput.toLowerCase()}ff.png`,
      fields: [
        [
          { name: 'Hex', value: `\`#${hexInput}\`` },
          { name: 'RGB', value: `(${r}, ${g}, ${b})` }
        ]
      ]
    }

    return !this.error
  }
}
