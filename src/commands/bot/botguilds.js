const { ApplicationCommandOptionType } = require('discord.js')
const { RookCommand } = require('../../classes/command/rcommand.class.js')
const AsciiTable = require('ascii-table')

function ksort(obj){
  let keys = Object.keys(obj).sort(), sortedObj = {}

  for(let i in keys) {
    sortedObj[keys[i]] = obj[keys[i]]
  }

  return sortedObj
}

module.exports = class BotGuildsCommand extends RookCommand {
  constructor(client) {
    let comprops = {
      name: "botguilds",
      category: "bot",
      description: "Bot Guilds",
      flags: {
        user: "unapplicable",
        test: "basic"
      },
      options: [
        {
          name: "locale",
          description: "Locale",
          type: ApplicationCommandOptionType.String
        }
      ]
    }
    let props = {
      caption: { text: "Bot Guilds" }
    }
    super(
      client,
      {...comprops},
      {...props}
    )
  }

  async action(client, interaction, options) {
    this.props.description = []
    this.props.description.push(
      `***Guilds that ${client.user} is in:***`,
      ""
    )

    let guilds = client.guilds.cache
    let locale = options['locale']
    if (!locale) {
      locale = "en-AU"
    }

    let sorted = []
    for (let [guildID, guildData] of guilds) {
      let owner = await guildData.members.fetch(guildData.ownerId)
      if (owner?.user) {
        owner = owner.user
      }
      let bot = await guildData.members.cache.get(client.user.id)
      sorted[bot.joinedTimestamp] = {
        guild: {
          name: guildData.name,
          id: guildID
        },
        owner: {
          username: owner.username,
          discriminator: owner.discriminator,
          id: owner.id
        },
        added: new Date(bot.joinedTimestamp).toLocaleString(),
        addedTimestamp: Math.floor(new Date(bot.joinedTimestamp) / 1000),
        addedHammertime: `<t:${Math.floor(new Date(bot.joinedTimestamp) / 1000)}:f>`
      }
    }
    console.log("")
    console.log("---")
    let plural = "server" + ((Object.keys(sorted).length != 1) ? "s" : "")
    console.log(`${client.user.username}#${client.user.discriminator} (ID:${client.user.id}) is on ${Object.keys(sorted).length} ${plural}!`)
    const Table = new AsciiTable("", {})
      .setHeading("Type","Name","ID")
    for (let [guildID, guildData] of Object.entries(ksort(sorted))) {
      if (guildData?.guild) {
        let tier = guildData.guild.premiumTier
        if (!tier) { tier = 0 }
        Table.addRow("Guild",guildData.guild.name,`(ID:\'${guildData.guild.id}\')`)
          .addRow("Owner",`\'${guildData.owner.username}#${guildData.owner.discriminator}\'`,`(ID:\'${guildData.owner.id}\')`)
          .addRow("Added",guildData.added)
          .addRow("Tier",tier)
          .addRow("")
        this.props.description.push(
          `**Guild:** ${guildData.guild.name} (ID:\`${guildData.guild.id}\`)`,
          `**Owner:** \`${guildData.owner.username}#${guildData.owner.discriminator}\` (ID:\`${guildData.owner.id}\`, <@${guildData.owner.id}>)`,
          `**Added:** ${guildData.addedHammertime} (\`${guildData.addedTimestamp}\`)`,
          `**Tier:** ${tier}`,
          ""
        )
      }
    }
    console.log(Table.toString())

    // Entities
    let entities = {
      bot: { name: client.user.name, avatar: client.user.avatarURL(), username: client.user.username }
    }
    // Players
    this.props.players = {
      user: entities.bot
    }

    return !this.error
  }
}
