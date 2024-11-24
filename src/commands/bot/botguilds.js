const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const AsciiTable = require('ascii-table')

function ksort(obj){
  let keys = Object.keys(obj).sort(), sortedObj = {};

  for(let i in keys) {
    sortedObj[keys[i]] = obj[keys[i]];
  }

  return sortedObj;
}

module.exports = {
  name: 'botguilds',
  description: 'Bot Guilds',
  options: [
    {
      name: 'locale',
      description: 'Locale',
      type: 3 // String
    }
  ],

  execute: async (client, interaction) => {
    await interaction.deferReply()

    let props = {
      title: {
        text: `Guilds that ${client.user.displayName} is in`
      },
      players: {
        user: {
          name: interaction.user.displayName,
          avatar: interaction.user.avatarURL(),
          username: interaction.user.username
        },
        target: {
          name: client.user.displayName,
          avatar: client.user.avatarURL(),
          username: client.user.username
        }
      }
    }

    let guilds = client.guilds.cache
    let locale = interaction.options.getString('locale')
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
        added: new Date(bot.joinedTimestamp).toLocaleString(locale)
      }
    }
    console.log("")
    console.log("---")
    let plural = "server" + ((Object.keys(sorted).length != 1) ? "s" : "")
    console.log(`${client.user.username}#${client.user.discriminator} (ID:${client.user.id}) is on ${Object.keys(sorted).length} ${plural}!`)
    props.description = []
    const Table = new AsciiTable("", {})
      .setHeading("Type","Name","ID")
    for (let [guildID, guildData] of Object.entries(ksort(sorted))) {
      let tier = guildData.guild.premiumTier
      if (!tier) { tier = 0 }
      Table.addRow("Guild",guildData.guild.name,`(ID:\'${guildData.guild.id}\')`)
        .addRow("Owner",`\'${guildData.owner.username}#${guildData.owner.discriminator}\'`,`(ID:\'${guildData.owner.id}\')`)
        .addRow("Added",guildData.added)
        .addRow("Tier",tier)
        .addRow("")
      props.description.push(
        `**Guild:** ${guildData.guild.name} (ID:\`${guildData.guild.id}\`)`,
        `**Owner:** \`${guildData.owner.username}#${guildData.owner.discriminator}\` (ID:\`${guildData.owner.id}\`, <@${guildData.owner.id}>)`,
        `**Added:** ${guildData.added}`,
        `**Tier:** ${tier}`,
        ""
      )
    }
    console.log(Table.toString())

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  }
}
