const { ApplicationCommandOptionType } = require('discord.js')
const SeedAnnounceCommand = require('../rando/seedannounce')

/**
 * @class
 * @classdesc SMALttPR Seed Announcer
 * @this {SMZ3SeedCommand}
 * @extends {SeedAnnounceCommand}
 * @public
 */
module.exports = class SMZ3SeedCommand extends SeedAnnounceCommand {
  constructor(client) {
    let comprops = {
      name: "smz3",
      description: "SMZ3 Seed Announcer",
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
    super(
      client,
      {...comprops},
      {}
    )
  }

  async execute(client, interaction) {
    let coptions = interaction.options
    let options = {
      rando: "smz3",
      "ping-multiplayer-role": coptions["ping-multiplayer-role"] ?? false,
      "seed-url": coptions["seed-url"] ?? "",
      "prep-time": coptions["prep-time"] ?? 0
    }
    await super.execute(
      client,
      interaction,
      options
    )
  }
}
