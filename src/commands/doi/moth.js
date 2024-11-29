const { Client, Interaction } = require('discord.js');
const path = require('path');
const { RookCommand } = require('../../classes/command/rcommand.class');

module.exports = class MothCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "moth",
      category: "doi",
      description: "Hear it from the legend himself"
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction) {
    // Path to the local video file
    const videoPath = path.join(__dirname, '..', '..', 'res', 'media', 'mothula.mp4');

    try {
      // Send the video to the channel the command was sent in
      await interaction.channel.send({
        files: [videoPath],
      });
      this.null = true
    } catch (error) {
      this.error = true
      this.props.description = "There was an error uploading the video."
      console.log(`There was an error when uploading the video: ${error.stack}`);
    }
  }
};
