const { PermissionFlagsBits } = require('discord.js')
const { AdminCommand } = require('./admincommand.class')

/**
 * @class
 * @classdesc Build a Command for BotDevs-only
 * @this {BotDevCommand}
 * @extends {AdminCommand}
 * @public
 */
class BotDevCommand extends AdminCommand {
  constructor(comprops, props) {
    // BotPerms: Administrator
    comprops.botPermssions = [PermissionFlagsBits.Administrator]
    // Category: BotDev
    comprops.access = comprops?.access ? comprops.access : "BotDev"

    // Create parent object
    super(
      {...comprops},
      {...props}
    )
  }
}

exports.BotDevCommand = BotDevCommand
