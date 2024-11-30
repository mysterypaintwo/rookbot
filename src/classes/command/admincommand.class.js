const { PermissionFlagsBits } = require('discord.js')
const { RookCommand } = require('./rcommand.class')

/**
 * @class
 * @classdesc Build a Command for Admins-only
 * @this {AdminCommand}
 * @extends {RookCommand}
 * @public
 */
class AdminCommand extends RookCommand {
  constructor(comprops, props) {
    comprops.permissionsRequired = [PermissionFlagsBits.Administrator]
    comprops.botPermssions = [PermissionFlagsBits.Administrator]
    comprops.access = "Admin"

    super(
      {...comprops},
      {...props}
    )
  }
}

exports.AdminCommand = AdminCommand
