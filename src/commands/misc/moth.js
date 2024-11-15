const { Client, Interaction } = require('discord.js');
const path = require('path');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    // Path to the local video file
    const videoPath = path.join(__dirname, '..', '..', 'res', 'media', 'mothula.mp4');

    await interaction.deferReply();
    
    try {

      // Send the video to the channel the command was sent in
      await interaction.channel.send({
        files: [videoPath],
      });


      // Optional: If you want to delete the original command message after posting the video
      await interaction.deleteReply();
    } catch (error) {
      console.log(`There was an error when uploading the video: ${error}`);
      // If error occurs, use an ephemeral reply to privately inform the user
      await interaction.followUp({ content: 'There was an error uploading the video.', ephemeral: true });
    }
  },

  name: 'moth',
  description: 'Hear it from the legend himself',
};
