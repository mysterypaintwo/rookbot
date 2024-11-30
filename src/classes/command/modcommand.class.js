const { PermissionFlagsBits } = require('discord.js')
const { AdminCommand } = require('./admincommand.class')

/**
 * @class
 * @classdesc Build a Command for Mods-only
 * @this {ModCommand}
 * @extends {AdminCommand}
 * @public
 */
class ModCommand extends AdminCommand {
  constructor(comprops, props) {
    if (!comprops?.permissionsRequired) {
      comprops.permissionsRequired = [PermissionFlagsBits.KickMembers]
    }
    if (!comprops?.permissionsRequired) {
      comprops.botPermssions = [PermissionFlagsBits.KickMembers]
    }
    comprops.access = "Mod"

    super(
      {...comprops},
      {...props}
    )
  }
}

exports.ModCommand = ModCommand
