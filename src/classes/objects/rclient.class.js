const getProfile = require('../../utils/getProfile')
const { Client } = require('discord.js')

class RookClient extends Client {
  constructor(args={}, profileName="default") {
    super(args)

    this.commands     = {}
    this.guild        = null
    this.guildID      = process.env.GUILD_ID
    this.profileName  = profileName
    this.profile      = getProfile(this.profileName)
  }
}

exports.RookClient = RookClient
