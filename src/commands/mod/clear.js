const { SlimEmbed } = require('../../classes/embed/rslimbed.class.js')
const fs = require('fs')

module.exports = {
  name: 'clear',
  description: 'Clear Messages',

  execute: async (client, interaction) => {
    await interaction.deferReply()

    let props = {
      title: { text: "Clearing messages..." },
      description: ""
    }

    let ROLES = JSON.parse(fs.readFileSync(`./src/dbs/${interaction.guild.id}/roles.json`, "utf8"))
    let APPROVED_ROLES = ROLES["admin"].concat(ROLES["mod"])
    let duration = ""

    if(!(await interaction.member.roles.cache.some(r=>APPROVED_ROLES.includes(r.name))) ) {
      error = true
      props.title.text = "Error"
      props.description = "Sorry, only admins can run this command. 😔"
    } else {
      limit = 100

      if(props.description == "") {
        await interaction.channel.messages.fetch( {
          limit: limit
        })
        .then(messages => {
          interaction.channel.bulkDelete(messages)
        })
        duration = "5s"
        props.description = `Clearing ${limit} messages in ${duration}.`
      }
    }

    let embed = new SlimEmbed(props)

    await interaction.editReply({ embeds: [ embed ] })
  }
}
