const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

module.exports = class WarnCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "warn",
      category: "mod",
      description: "Warns a user in the server.",
      options: [
        {
          name: "user-id",
          description: "The ID of the user you want to warn.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for warning the user.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      permissionsRequired: [PermissionFlagsBits.ManageMessages],
      botPermissions: [PermissionFlagsBits.ManageMessages],
    }
    let props = {}

    super(
      {...comprops},
      {...props}
    )
  }

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async action(client, interaction) {
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const targetUserInput = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be warned
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      this.error = true
      this.props.description = `User not found (ID: ${targetUserId}).`
      return;
    }

    // Check if the user is in the server (guild)
    const guildMember = interaction.guild.members.cache.get(targetUserId);
    if (!guildMember) {
      this.error = true
      this.props.description = `User is not in the server (ID: ${targetUserId}).`
      return;
    }

    // Attempt to warn the user
    try {
      // Determine the name to display
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the warning
      let props = {
        color: colors["success"],
        title: {
          text: "Success!"
        },
        description: (this.DEV ? "DEV: " : "") + `User **${targetUserName}** has been **warned**. (${reason})`
      }
      const embed = new RookEmbed(props)
      interaction.channel.send({ embeds: [ embed ] });

      if (!this.DEV) {
        // Try to DM the user about the warning (private)
        try {
          props = {
            color: colors["warning"],
            title: {
              text: "Warned"
            },
            description: `⚠️ You have been warned in the ${interaction.guild.name} server. (${reason})`
          }
          const embed = new RookEmbed(props)
          await targetUser.send({ embeds: [ embed ] });
          this.props.description = `User successfully warned via DMs! Message: ${props.description}`
        } catch (dmError) {
          console.log(`Failed to DM user: ${dmError.message}`);
          this.error = true
          this.props.description = `I couldn't send the DM to the user (ID: ${targetUserId}). They might have DMs disabled.`
        }
      } else {
        this.props.description = (this.DEV ? "DEV: " : "") + this.props.description
      }

      if (!this.DEV) {
        // Log the action in the logs channel (private)
        const logs = client.channels.cache.get(guildChannels["logging"]);
        if (logs) {
          let props = {
            color: colors["warning"],
            title: {
              text: "⚠️ User Warned"
            },
            fields: [
              { name: 'User Warned',  value: `${targetUser}\n(ID: ${targetUserId})`,              inline: true },
              { name: 'Warned By',    value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true },
              { name: 'Reason',       value: reason,                                              inline: false }
            ]
          }
          const embed = new RookEmbed(props)

          logs.send({ embeds: [ embed ] });
        } else {
          console.log("Logs channel not found.");
        }
      }
      // Complete the interaction with a private success message
      this.props.description = (this.DEV ? "DEV: " : "") + `<@${targetUserId}> has been successfully **warned** (${reason})!`
    } catch (error) {
      console.log(`There was an error when warning: ${error.stack}`);
      this.error = true
      this.ephemeral = true
      this.description = `I couldn't warn that user (ID: ${targetUserId}).`
    }
  }
};
