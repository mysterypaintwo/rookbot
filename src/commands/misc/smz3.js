const { sahaBotUserID, multiplayerSchedulingChanID } = require('../../../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'smz3',
  description: 'Starts an SMZ3 game with all necessary details.',
  options: [
    {
      name: 'ping_multiplayer_role',
      description: 'Whether or not to ping the Multiplayer Ping role.',
      type: 5, // Boolean type
      required: false, // Optional parameter
    },
  ],

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  callback: async (client, interaction) => {
    // Ensure the command is used in the correct channel
    if (interaction.channelId !== multiplayerSchedulingChanID) {
      return await interaction.reply({
        content: `This command can only be used in <#${multiplayerSchedulingChanID}>.`,
        ephemeral: true, // Makes the reply visible only to the user who invoked the command
      });
    }

    const pingMultiplayerRole =
      interaction.options.getBoolean('ping_multiplayer_role') || false; // Default to false

    const sahaBot = client.users.cache.get(sahaBotUserID);

    if (!sahaBot) {
      await interaction.reply("Sahasrala bot not found on this server.");
      return;
    }

    try {
      // Send "/smz3 preset: normal" to Sahasrala bot
      await sahaBot.send('/smz3 preset: normal');

      // Generate a random number between 0 and 10000000000 for the group name
      const randNum = Math.floor(Math.random() * 10000000001);
      const groupName = `zdoi${randNum}`;

      // Get the current timestamp and round it to the nearest upcoming 15-minute interval
      const now = new Date();
      const roundedTime = new Date(
        Math.ceil(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)
      );

      // Format the timestamp for Discord
      const timestamp = `<t:${Math.floor(roundedTime.getTime() / 1000)}:F>`; // Formatted for user's local time

      // Array of cheeky footer texts
      const footerTexts = [
        'Good luck out there, adventurer!',
        'May the RNG be ever in your favor!',
        'Don\'t forget to grab the Moon Pearl!',
        'Watch out for those pesky Lynels!',
        'Hookshot, Bombs, Boots, Go!',
        'Hoping Fire Rod won\'t be on pedestal!',
        'Hoping Pegasus Boots won\'t be at library!',
        'Hoping we\'ll get a sword within the first hour!',
        'Hoping we\'ll find Morph Ball within the first hour!',
        'Hoping we\'ll find Morph Bombs before Power Bombs!',
      ];

      // Pick a random footer text
      const randomFooterText = footerTexts[Math.floor(Math.random() * footerTexts.length)];

      // Create an embed to display all details
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('SMZ3 Game Details')
        .addFields(
          { name: 'Group Name', value: groupName, inline: false },
          {
            name: 'Preset Sent to Sahasrala Bot',
            value: '`/smz3 preset: normal`',
            inline: false,
          },
          {
            name: 'Scripts',
            value: '[2022 (`alttpo-client-win64-stable-20220213.1`)](https://dev.azure.com/ALttPO/alttpo/_build/results?buildId=693&view=artifacts&pathAsName=false&type=publishedArtifacts)',
            inline: false,
          },
          {
            name: 'Start Game Reminder',
            value: '**Please wait on the Start Game with everyone until the game begins.**',
            inline: false,
          },
          {
            name: 'Game Start Time',
            value: `The game will begin at ${timestamp}.`,
            inline: false,
          }
        )
        .setFooter({ text: randomFooterText })
        .setTimestamp();

        await interaction.deferReply({ ephemeral: true }); // Defer the reply to acknowledge the interaction

        try {
        // Construct the content for the channel message
        const messageContent = pingMultiplayerRole
            ? `<@&Multiplayer Ping> A Super Metroid + ALTTP (SMZ3) Randomizer game has been generated!\nYou can download it from SahasrahBot's post.` // Includes ping
            : `A Super Metroid + ALTTP (SMZ3) Randomizer game has been generated!\nYou can download it from SahasrahBot's post.`; // Excludes ping

        // Send the embed message to the channel
        const channel = interaction.channel; // Use the channel where the command was invoked
        await channel.send({
            content: messageContent,
            embeds: [embed],
        });

        // Finalize the interaction with a confirmation to the user
        await interaction.followUp({
            content: 'The SMZ3 game has been successfully set up and announced in the channel!',
            ephemeral: true, // Keep it private to the user
        });
        } catch (error) {
        console.error('Error handling /smz3 command:', error);

        // Respond with an error message if something goes wrong
        await interaction.followUp({
            content: 'An error occurred while setting up the SMZ3 game. Please try again later.',
            ephemeral: true,
        });
        }

    } catch (error) {
      console.error('Error handling /smz3 command:', error);
      await interaction.reply(
        'An error occurred while setting up the SMZ3 game. Please try again later.'
      );
    }
  },
};
