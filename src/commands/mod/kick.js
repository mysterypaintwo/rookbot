const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

module.exports = class KickCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "kick",
      description: "Kicks a user from the server.",
      options: [
        {
          name: "user-id",
          description: "The ID of the user you want to kick.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for kicking the user.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      permissionsRequired: [PermissionFlagsBits.KickMembers],
      botPermissions: [PermissionFlagsBits.KickMembers],
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
    const PROFILE = require('../../PROFILE.json');
    const guildID = interaction.guild.id;
    const guildChannels = require(`../../dbs/${guildID}/channels.json`);
    const targetUserInput = interaction.options.get('user-id').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    // Extract user ID from mention (if it's a mention)
    const targetUserId = targetUserInput.replace(/[<@!>]/g, '');  // Remove <@>, <@!>, and >

    // Get the user to be kicked
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      this.error = true
      this.props.description = "User not found."
      return
    }

    // Check if the user is in the server (guild)
    const guildMember = interaction.guild.members.cache.get(targetUserId);
    if (!guildMember) {
      this.error = true
      this.props.description = "User is not in the server."
      return
    }

    // Attempt to kick the user
    try {
      // Kick the user from the server
      if (!this.DEV) {
        await interaction.guild.members.kick(targetUserId, { reason });
      }

      // Determine the name to display
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the kick
      this.props.color = colors["success"]
      this.props.title = { text: "Success!" }
      this.props.description = `User **${targetUserName}** has been **kicked**. (${reason})`

      if (!this.DEV) {
        // Try to DM the user about the kick (private)
        try {
          let props = {
            color: colors["bad"],
            title: {
              text: "Kicked"
            },
            description: `You have been kicked from the ${interaction.guild.name} server. (${reason})`
          }
          const dm_embed = new RookEmbed(props)
          await targetUser.send({ embeds: [ dm_embed ] })

          props = {
            color: color["success"],
            title: {
              text: "Kicked"
            },
            description: `✅ User **${targetUserName}** successfully kicked via DMs! Message: ${props.description}`
          }
          const mod_embed = new RookEmbed(props);
          interaction.reply(
            {
              embeds: [ mod_embed ],
              ephemeral: true
            }
          )
        } catch (dmError) {
          console.log(`Failed to DM user: ${dmError.message}`);
          this.error = true
          this.ephemeral = true
          this.props.description = `I couldn't send the DM to the user (ID ${targetUserId}). They might have DMs disabled.`
        }
      } else {
        this.props.description = (this.DEV ? "DEV: " : "") + this.props.description
      }

      if (!this.DEV) {
        // Log the action in the logs channel (private)
        const logs = client.channels.cache.get(guildChannels["logging"]);
        if (logs) {
          let log_props = {
            color: colors["bad"],
            title: {
              text: "👟💥🏃‍♂️ User Kicked"
            },
            fields: [
              { name: 'User Kicked',  value: `${targetUser}\n(ID: ${targetUserId})`,              inline: true },
              { name: 'Kicked By',    value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true },
              { name: 'Reason',       value: reason,                                             inline: false }
            ]
          }
          const log_embed = new RookEmbed(log_props)
          logs.send(log_embed)
        } else {
          console.log("Logs channel not found.");
        }
      }
    } catch (error) {
      console.log(`There was an error when kicking: ${error.stack}`);
      this.error = true
      this.ephemeral = true
      this.props.description = `I couldn't kick that user (ID: ${targetUserId}).`
    }
  }
};
