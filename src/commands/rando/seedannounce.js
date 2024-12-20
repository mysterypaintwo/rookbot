const { ApplicationCommandOptionType } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class');
const timeFormat = require('../../utils/timeFormat.js')

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

module.exports = class SeedAnnounceCommand extends RookCommand {
  constructor(client) {
    let comprops = {
      name: "seedannounce",
      category: "rando",
      description: "Starts a specified Randonizer Game with all necessary details",
      options: [
        {
          name: "randomizer",
          description: "Randomizer to choose",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "Super Metroid + A Link to the Past Combination Randomizer", value: "smz3" },
            { name: "Super Metroid Map Randomizer", value: "m3maprando" }
          ]
        },
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
    let props = {}
    super(
      client,
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction, options) {
    const randomizer = options.randomizer || "smz3"
    const guildID = interaction.guild.id;
    const userIDs = require("../../dbs/userids.json");

    const pingMultiplayerRole = options['ping-multiplayer-role'] || false; // Default to false
    const randoID = options.randomizer
    const seedURL = options['seed_url'] || null;
    const prepTimeMinutes = options['prep_time'] ?? 5; // Default to 5 minutes

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

    this.props.title = {
      text: `${randomizer} Game Details`
    }

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
      const timestamp = timeFormat(adjustedTime.getTime())

      const randoData = require(`../../dbs/randos/${randomizer}.json`)
      const majorItems = randoData["madlibs"]["major"]
      const uselessItems = randoData["madlibs"]["useless"]
      const footerTexts = randoData["madlibs"]["footers"]

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
        name: randoData.rando.player.name,
        avatar: randoData.rando.player.avatar
      }
      this.props.fields = [
        [
          { name: 'Group Name', value: groupName }
        ],
        [
          {
            name: 'Scripts',
            value: randoData.rando.scripts,
          }
        ],
        [
          {
            name: '__Start Game Reminder__',
            value: 'Please wait on the Start Game with everyone until the game begins.',
          }
        ],
        [
          {
            name: 'Game Start Time',
            value: `The game will begin at ${timestamp}.`,
            inline: false,
          }
        ]
      ]
      this.props.footer = {
        text: randomFooterText
      }

      // Construct the content for the channel message
      let roleID = options["pingable-role-id"]
      let messageContent = pingMultiplayerRole ? `<@&${roleID}>` : ""
      messageContent += `A ${randomizer} game has been generated!`

      if (isValidURLFromDomain(seedURL, randoData.rando.permalink.replace("<hash>",""))) {
        messageContent += `\nYou can download it from here: ${seedURL}`;
      }

      this.props.description = messageContent

      // Silent conclusion (no visible follow-up)

    } catch (error) {
      console.error(`Error handling /${this.name} command:`, error);

      this.error = true
      // Respond with an error message if something goes wrong
      this.props.description = `An error occurred while setting up the ${randomizer} game. Please try again later.`
    }

    return !this.error
  }
}
