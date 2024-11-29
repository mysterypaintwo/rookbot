const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { RookCommand } = require('../../classes/command/rcommand.class')
const { RookEmbed } = require('../../classes/embed/rembed.class');
const colors = require('../../dbs/colors.json')

module.exports = class UnbanCommand extends RookCommand {
  constructor() {
    let comprops = {
      name: "unban",
      description: "Unbans a user from the server.",
      options: [
        {
          name: "user-id",
          description: "The ID of the user you want to unban.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for unbanning the user.",
          type: ApplicationCommandOptionType.String,
          required: false,
        }
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

    // Get the user to be unbanned
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

    try {
      if (!this.DEV) {
        // Unban the user
        await interaction.guild.bans.remove(targetUserId, reason);
      }

      // Get the user object for the unbanned user
      const targetUser = await client.users.fetch(targetUserId);

      const targetUserName = targetUser.nickname || targetUser.displayName || targetUser.tag || targetUser.username;

      // Reply publicly in the channel to confirm the unban
      this.props.color = colors["success"]
      this.props.title = { text: "Success!" }
      this.props.description = `User **${targetUserName}** has been **unbanned**. (${reason})`

      if (!this.DEV) {
        // Try to DM the user about the unban (private)
        try {
          let props = {
            color: colors["success"],
            title: {
              text: "Unbanned"
            },
            description: `You have been unbanned from the ${interaction.guild.name} server.`
          }
          const dm_embed = new RookEmbed(props);
          await targetUser.send({ embeds: [ dm_embed ] });

          props = {
            color: colors["success"],
            title: {
              text: "Success!"
            },
            description: `✅ User **${targetUserName}** successfully unbanned via DMs! Message: ${props.description}`
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
              text: "🔨 User Unbanned"
            },
            fields: [
              { name: 'User Unbanned',  value: `${targetUser}\n(ID: ${targetUserId})`,              inline: true },
              { name: 'Unbanned By',    value: `${interaction.user}\n(ID: ${interaction.user.id})`, inline: true }
            ]
          }
          const embed = new RookEmbed(props)
          logs.send({ embeds: [ embed ] });
        } else {
          console.log("Logs channel not found.");
        }
      }
    } catch (error) {
      console.log(`There was an error when unbanning: ${error.stack}`);
      this.error = true
      this.ephemeral = true
      this.props.description = `I couldn't unban that user (ID: ${$targetUserId}).`
    }
  }
};
