const { ApplicationCommandOptionType } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class');

function isValidURLFromDomain(input, domain) {
  try {
      // Parse the input string as a URL
      const url = new URL(input);

      // Check if the hostname and protocol match the expected domain
      const expectedUrl = new URL(domain);
      return url.hostname === expectedUrl.hostname && url.protocol === expectedUrl.protocol;
  } catch (error) {
      // If URL constructor throws, the input is not a valid URL
      return false;
  }
}

module.exports = class Z3M3AnnounceCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "smz3",
      category: "rando",
      description: "Starts an SMZ3 game with all necessary details",
      options: [
        {
          name: "ping-multiplayer-role",
          description: "Whether or not to ping the Multiplayer Ping role",
          type: ApplicationCommandOptionType.Boolean,
          required: false
        },
        {
          name: 'seed-url',
          description: 'The URL of the seed to play',
          type: ApplicationCommandOptionType.String,
          required: false
        },
        {
          name: 'prep-time',
          description: 'The number of minutes to prepare before the game starts.',
          type: ApplicationCommandOptionType.Integer,
          required: false
        }
      ]
    }
    let props = {
      title: {
        text: "SMZ3 Game Details"
      }
    }

    super(
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction) {
    const guildID = interaction.guild.id;
    const userIDs = require("../../dbs/userids.json");

    const pingMultiplayerRole = interaction.options.getBoolean('ping_multiplayer_role') || false; // Default to false
    const seedURL = interaction.options.getString('seed_url') || null;
    const prepTimeMinutes = interaction.options.getInteger('prep_time') ?? 5; // Default to 5 minutes

      /*
    const sahaBot = interaction.guild.members.fetch(userIDs['sahabot']);

    if (!sahaBot) {
      await interaction.reply({
        content: `Sahasrala bot not found on this server. <@${userIDs['sahabot']}>`,
        ephemeral: true,
      });
      return;
    }*/

     // Defer reply silently

    try {
      // Generate random group name
      const randNum = Math.floor(Math.random() * 10000000001);
      const groupName = `zdoi${randNum}`;

      // Get the current timestamp and add <prepTimeMinutes> minutes of prep time
      const now = new Date();

      const maxAllowedMinutes = 10080;
      if (prepTimeMinutes > maxAllowedMinutes) {
        this.error = true
        // Respond with an error message if something goes wrong
        this.props.title = {
          text: "Invalid Prep Time Duration"
        }
        this.props.description = `Exceeded max duration of ${maxAllowedMinutes} minutes (1 week). Please try again.`
      } else if (prepTimeMinutes < 0) {
        this.error = true
        // Respond with an error message if something goes wrong
        this.props.title = {
          text: "Invalid Prep Time Duration"
        }
        this.props.description = `Duration ${prepTimeMinutes} minutes **may not be negative**. Please try again.`
      }

      const prepTime = prepTimeMinutes * 60 * 1000; // Convert minutes to milliseconds
      const adjustedTime = new Date(now.getTime() + prepTime);
      const timestamp = `<t:${Math.floor(adjustedTime.getTime() / 1000)}:F>`;

      // Define the Major Items
      const majorItems = [
        'Morph Ball',
        'Pegasus Boots',
        'Fire Rod',
        'Hookshot',
        'Moon Pearl',
        'Flippers',
        'Hammer',
        'Flute',
        'Magic Mirror',
        'A Progressive Bow',
        'A Progressive Sword',
        'A Progressive Glove',
        'Lamp',
        'Half-Magic',
        'Morph Ball',
        'Morph Bombs',
        'Charge Beam',
        'Speed Booster',
        'a Progressive Suit',
        'Hi-Jump Boots',
        'Varia Suit',
        'Gravity Suit',
        'Space Jump',
        'Plasma Beam',
        'Screw Attack',
        'Ice Beam'
      ]

      const uselessItems = [
        '3 Bombs',
        'greg',
        'Validation Arrow',
        '20 Rupees',
        '1 Rupee',
        '5 Rupees',
        'Blue-merang',
        'Mushroom',
        'Shovel',
        'Cane of Byrna',
        'Magic Cape',
        'Spring Ball',
        'Spazer Beam',
        'Grapple Beam'
      ]

      // Random footer text
      const footerTexts = [
        'Good luck out there, adventurer!',
        'May the RNG be ever in your favor!',
        'I wonder who we\'ll be microwaving today~',
        'Don\'t forget to grab [MAJOR_ITEM]!',
        'Watch out for those pesky Lynels!',
        'Hookshot, Bombs, Boots, Go!',
        'Hoping [MAJOR_ITEM] won\'t be on Pedestal!',
        'Hoping [MAJOR_ITEM] won\'t be at Library!',
        'Hoping [MAJOR_ITEM] won\'t be at Lumberjack Cave!',
        'Hoping [MAJOR_ITEM] won\'t be at Mimic Cave!',
        'Hoping [MAJOR_ITEM] won\'t be at Graveyard Ledge!',
        'Hoping we\'ll get a sword within the first hour!',
        'Hoping we\'ll find [MAJOR_ITEM] within the first hour!',
        'Hoping we\'ll find Morph Bombs before Power Bombs!',
        'Hoping that Blind\'s pun will make us laugh today!',
        'Hoping that [MAJOR_ITEM] will be in Blind\'s Hut!',
        'Praying we won\'t have to do Suitless Maridia!',
        'Hoping SM won\'t require Reverse Boss Order (RBO)!',
        'Who wants to do a hookpush vs Ganon? <:',
        'Let\'s have a beat-up party at Ganon\'s!',
        'Hoping that Boots hovering won\'t be required this time!',
        'Who\'s ready for some silverless Ganon action??',
        'please no aga1 seed im allergic',
        'No Charge Beam vs Mother Brain? No problem 👍',
        'Discount [USELESS_ITEM] at King Zora! Only 500 Rupees!',
        'Don\'t worry—There\'ll be at least one sword outside of Ganon\'s Tower!',
        '[MAJOR_ITEM] on Pedestal? No problem—just hike over the mountain!',
        'Why run when you can clip through instead? 😎'
      ];

      // Select a random footer text
      var randomFooterText = footerTexts[Math.floor(Math.random() * footerTexts.length)];

      // Select a random major item
      const randomMajorItem = majorItems[Math.floor(Math.random() * majorItems.length)];
      const randomUselessItem = uselessItems[Math.floor(Math.random() * uselessItems.length)];

      // Modify the major item if it starts with "A " and if it's not at the beginning of the sentence
      let formattedMajorItem = randomMajorItem;
      if (formattedMajorItem.startsWith('A ') && randomFooterText.indexOf('[MAJOR_ITEM]') > 0) {
        // Only lowercase the first letter if '[MAJOR_ITEM]' is in the middle
        formattedMajorItem = formattedMajorItem.charAt(0).toLowerCase() + formattedMajorItem.slice(1);
      }

      // Replace '[MAJOR_ITEM]' with the modified major item
      randomFooterText = randomFooterText.replace('[MAJOR_ITEM]', formattedMajorItem);

      // Replace '[USELESS_ITEM]' with the modified major item
      randomFooterText = randomFooterText.replace('[USELESS_ITEM]', randomUselessItem);

      // Create the embed
      let players = {}
      players["target"] = {
        name: "SMZ3",
        avatar: "http://alttp.mymm1.com/holyimage/images/alttpo/smz3.png"
      }
      this.props.fields = [
        { name: 'Group Name', value: groupName, inline: false },
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
      ]
      this.props.footer = {
        msg: randomFooterText
      }

      // Construct the content for the channel message
      let messageContent = pingMultiplayerRole
        ? `<@&1300904313081565236> A Super Metroid + ALTTP (SMZ3) Randomizer game has been generated!`
        : `A Super Metroid + ALTTP (SMZ3) Randomizer game has been generated!`;

      if (isValidURLFromDomain(seedURL, 'https://samus.link/seed/')) {
        messageContent += `\nYou can download it from here: ${seedURL}`;
      }

      this.props.description = messageContent

      // Silent conclusion (no visible follow-up)

    } catch (error) {
      console.error('Error handling /smz3 command:', error);

      this.error = true
      // Respond with an error message if something goes wrong
      this.props.description = "An error occurred while setting up the SMZ3 game. Please try again later."
    }
  }
}
