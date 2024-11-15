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
      await interaction.reply({
        content: 'Sahasrala bot not found on this server.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true }); // Defer reply silently

    try {
      // Send `/smz3 preset: normal` to Sahasrala bot
      await sahaBot.send('/smz3 preset: normal');

      // Generate random group name
      const randNum = Math.floor(Math.random() * 10000000001);
      const groupName = `zdoi${randNum}`;

      // Get the current timestamp and round it to the nearest upcoming 15-minute interval
      const now = new Date();
      const roundedTime = new Date(
        Math.ceil(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)
      );
      const timestamp = `<t:${Math.floor(roundedTime.getTime() / 1000)}:F>`;

      // Random footer text
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
        'Hoping that a Progressive Suit won\'t be on pedestal!',
        'Hoping that a Progressive Glove won\'t be at Lumberjack Cave!',
        'Hoping that Morph Ball will be in Blind\'s Hut!',
        'Discount bombs at King Zora! Only 500 Rupees!',
        'Hoping Gravity Suit won\'t be at Lumberjack Cave!',
        'Praying we won\'t have to do Suitless Maridia!',
        'Hoping SM won\'t require Reverse Boss Order (RBO)!',
        'Who wants to do a hookpush vs Gannon? <:',
        'Let\'s have a beat-up party at Gannon\'s!',
        'Hoping that Boots hovering won\'t be required this time!'
      ];
      const randomFooterText =
        footerTexts[Math.floor(Math.random() * footerTexts.length)];

      // Create the embed
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
            name: '__Start Game Reminder__',
            value: 'Please wait on the Start Game with everyone until the game begins.',
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

      // Construct the content for the channel message
      const messageContent = pingMultiplayerRole
        ? `<@&Multiplayer Ping> A Super Metroid + ALTTP (SMZ3) Randomizer game has been generated!\nYou can download it from SahasrahBot's post.`
        : `A Super Metroid + ALTTP (SMZ3) Randomizer game has been generated!\nYou can download it from SahasrahBot's post.`;

      // Send the embed to the channel
      const channel = interaction.channel;
      await channel.send({
        content: messageContent,
        embeds: [embed],
      });

      // Silent conclusion (no visible follow-up)
      await interaction.deleteReply();
    } catch (error) {
      console.error('Error handling /smz3 command:', error);

      // Respond with an error message if something goes wrong
      await interaction.followUp({
        content:
          'An error occurred while setting up the SMZ3 game. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
