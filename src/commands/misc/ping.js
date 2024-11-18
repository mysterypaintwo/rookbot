const { EmbedBuilder } = require('discord.js')

module.exports = {
  name: 'ping',
  description: 'Pong!',
  // devOnly: Boolean,
  testOnly: true,
  // options: Object[],
  // deleted: Boolean,

  execute: async (client, interaction) => {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setTitle("Pong!")
      .setDescription(`Client: ${ping}ms | Websocket: ${client.ws.ping}ms`)
      .setImage("https://i.pinimg.com/originals/c8/8c/2f/c88c2fa6b66b89717ddeaafaf8c4d264.gif")

    await interaction.editReply({ embeds: [ embed ] });
  }
};
