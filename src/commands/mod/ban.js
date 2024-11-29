const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class.js')
const { RookEmbed } = require('../../classes/embed/rembed.class.js')
const colors = require('../../dbs/colors.json')

module.exports = class BanCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "ban",
      category: "mod",
      description: "Bans a user from the server",
      options: [
        {
          name: "user-id",
          description: "The ID of the user you want to ban.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for banning the user.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      permissionsRequired: [PermissionFlagsBits.BanMembers],
      botPermissions: [PermissionFlagsBits.BanMembers],
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

    // Get the user to be banned
    let targetUser;
    try {
      targetUser = await client.users.fetch(targetUserId);
    } catch (error) {
      this.error = true
      this.props.description = "User not found."
      return
    }

    // Get the guild member (to fetch nickname if present)
    const guildMember = interaction.guild.members.cache.get(targetUserId);

    // Attempt to ban the user
    try {
      // Ban the user from the server
      if (!this.DEV) {
        await interaction.guild.members.ban(targetUserId, { reason });
      }

      // Determine the name to display (use nickname if available, otherwise default to tag or username)
      const targetUserName = guildMember?.nickname || targetUser.username;

      // Reply publicly in the channel to confirm the ban
      this.props.color = colors["success"]
      this.props.title = { text: "Success!" }
      this.props.description = `User **${targetUserName}** has been **banned**. (${reason})`

      if (!this.DEV) {
        // Try to DM the user about the ban (private)
        try {
          let props = {
            color: colors["bad"],
            title: {
              text: "Banned"
            },
            description: `You have been banned from the ${interaction.guild.name} server. (${reason})`
          }
          const dm_embed = new RookEmbed(props);
          await targetUser.send({ embeds: [ dm_embed ] });

          props = {
            color: colors["success"],
            title: {
              text: "Success!"
            },
            description: `✅ User **${targetUserName}** successfully banned via DMs! Message: ${props.description}`
          }
          const mod_embed = new RookEmbed(props);
          await interaction.followUp(
            {
              embeds: [ mod_embed ],
              ephemeral: true
            }
          );
        } catch (dmError) {
          console.log(`Failed to DM user: ${dmError.message}`);
          let props = {
            color: colors["red"],
            title: {
              text: "Error"
            },
            description: `I couldn't send the DM to the user (ID: ${targetUserId}). They might have DMs disabled.`
          }
          const mod_embed = new RookEmbed(props)
          await interaction.followUp(
            {
              embeds: [ mod_embed ],
              ephemeral: true
            }
          );
        }
      } else {
        this.props.description = (this.DEV ? "DEV: " : "") + this.props.description
      }

      if (!this.DEV) {
        // Log the action in the logs channel (private)
        const logs = client.channels.cache.get(guildChannels["logging"]);
        if (logs) {
          let props = {
            color: colors["bad"],
            title: {
              text: "🔨 User Banned"
            },
            fields: [
              { name: 'User Banned',  value: `${targetUser}\n(ID: ${targetUserId})`,              inline: true },
              { name: 'Banned By',    value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true },
              { name: 'Reason',       value: reason,                                             inline: false }
            ]
          }
          const embed = new RookEmbed(props)
          logs.send({ embeds: [ embed ] });
        } else {
          console.log("Logs channel not found.");
        }
      }
    } catch (error) {
      console.log(`There was an error when banning: ${error.stack}`);
      this.error = true
      this.ephemeral = true
      this.props.description = `I couldn't ban that user (ID: ${$targetUserId}).`
    }
  }
};
