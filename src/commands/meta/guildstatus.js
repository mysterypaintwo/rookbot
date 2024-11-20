const { RookEmbed } = require('../../classes/embed/rembed.class.js')

module.exports = {
  name: 'guildstatus',
  description: 'Guild Status',

  execute: async (client, interaction) => {
    await interaction.deferReply()

    let props = {
      title: {
        text: "Guild Status"
      },
      players: {
        user: {
          name: interaction.user.displayName,
          avatar: interaction.user.avatarURL(),
          username: interaction.user.username
        },
        target: {
          name: interaction.guild.name,
          avatar: interaction.guild.iconURL()
        }
      }
    }

    let serverBoostEmoji = await interaction.guild.emojis.cache.find(emoji => emoji.name === "serverboost2")
    if (!(serverBoostEmoji)) {
      serverBoostEmoji = "[*]"
    }
    props.description = `**${interaction.guild.name}**`
    if (interaction.guild.features.length > 0) {
      props.description += "\n"
      props.description += "*Features*" + "\n" + '`'
      props.description += interaction.guild.features.join("`, `")
      props.description += '`'
    }

    props.fields = []

    if (interaction?.guild?.ownerId && interaction.guild.ownerId != "undefined") {
      // console.log(`Guild Owner: ${interaction.guild.ownerId}`)
      props.fields.push(
        {
          name: "Owner",
          value: `<@${interaction.guild.ownerId}>`
        }
      )
    }

    if (interaction?.guild?.vanityURLCode && interaction.guild.vanityURLCode != "") {
      let vanityURL = `https://discord.gg/${interaction.guild.vanityURLCode}`
      props.fields.push(
        {
          name: "Vanity URL",
          value: `[${interaction.guild.vanityURLCode}](${vanityURL} '${vanityURL}')`
        }
      )
    }

    props.fields.push(
      {
        name: "Members",
        value: interaction.guild.memberCount.toString(),
        inline: true
      },
      {
        name: "Server Level",
        value: interaction.guild.premiumTier == 0 ? `${interaction.guild.premiumTier}` : `${serverBoostEmoji}`.repeat(interaction.guild.premiumTier),
        inline: true
      },
      {
        name: "Partnered",
        value: interaction.guild.partnered ? "Yes" : "No",
        inline: true
      },
      {
        name: "Verified",
        value: interaction.guild.verified ? "Yes" : "No",
        inline: true
      },
      {
        name: "Created",
        value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:f>`,
      }
    )

    const embed = new RookEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  }
}
