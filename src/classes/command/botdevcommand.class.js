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
    comprops.permissionsRequired = [PermissionFlagsBits.Administrator]
    comprops.botPermssions = [PermissionFlagsBits.Administrator]
    comprops.access = comprops?.access ? comprops.access : "BotDev"

    super(
      {...comprops},
      {...props}
    )
  }
}

exports.BotDevCommand = BotDevCommand
