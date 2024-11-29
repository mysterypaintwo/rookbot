const { RookCommand } = require('../../classes/command/rcommand.class')

module.exports = class NLCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "nl",
      description: "Posts a rainbow divider line"
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }

  async execute(client, interaction) {
    // Function to generate a random rainbow color in hexadecimal format
    const getRandomRainbowColor = () => {
      const hue = Math.floor(Math.random() * 360); // Random hue value (0-360)
      const saturation = 1; // Full saturation
      const lightness = 0.5; // 50% lightness

      // Convert HSL to RGB
      const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
      const m = lightness - chroma / 2;
      let r = 0, g = 0, b = 0;

      if (hue >= 0 && hue < 60) [r, g, b] = [chroma, x, 0];
      else if (hue >= 60 && hue < 120) [r, g, b] = [x, chroma, 0];
      else if (hue >= 120 && hue < 180) [r, g, b] = [0, chroma, x];
      else if (hue >= 180 && hue < 240) [r, g, b] = [0, x, chroma];
      else if (hue >= 240 && hue < 300) [r, g, b] = [x, 0, chroma];
      else if (hue >= 300 && hue < 360) [r, g, b] = [chroma, 0, x];

      // Convert RGB to Hex
      const toHex = (value) => Math.round((value + m) * 255).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // Defer the reply silently (acknowledges the interaction without user notification)


    try {
      // Create the embed with the rainbow divider line image
      this.props.color = getRandomRainbowColor()
      this.props.image = "https://cdn.discordapp.com/attachments/565312923271168000/985473102702071838/divider-line.gif"

      // Optionally end the interaction without a visible message
    } catch (error) {
      console.error('Error handling /nl command:', error);

      this.error = true
      this.props.description = "An error occurred while posting the rainbow line. Pleas try again later."
    }


    interaction.channel.send({ content: this.props.image })
  }
};
