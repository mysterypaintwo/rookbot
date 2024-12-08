// @ts-check

const { Client, MessageFlags, TextChannel } = require('discord.js')
const { Pagination } = require('pagination.djs')
const { RookEmbed } = require('../embed/rembed.class')
const { SlimEmbed } = require('../embed/rslimbed.class')
const fs = require('fs')

/**
 * @class
 * @classdesc Build a Villains-branded Command
 * @this {RookCommand}
 * @public
 */
class RookCommand {
  /**
   * @type {string} Command Name
   */
  // @ts-ignore
  name;                 // Command Name
  category;             // Command Category
  options;              // Command Options
  testOptions;          // Test Options
  access;               // Command Access
  permissionsRequired;  // Required User Permissions
  botPermissions;       // Required Bot Permissions
  /**
   * @type {boolean} Development Mode?
   */
  #DEV;     // Private: DEV flag
  /**
   * @type {boolean} Send Ephemeral?
   */
  #ephemeral; // Private: Ephemeral flag
  /**
   * @type {boolean} Send Independent?
   */
  #independent; // Private: Independent flag
  /**
   * @type {Object.<string, any>} List of properties for embed manipulation
   */
  #props;   // Private: Props to send to VillainsEmbed
  /**
   * @type {Array.<RookEmbed>} Array of embeds to print as pages or singly
   */
  #pages;   // Private: Pages to print
  /**
   * @type {Object.<string, string>} Flags for user management
   */
  #flags;   // Private: Flags for user management
  /**
   * @type {boolean} Set to true if we threw an error
   */
  #error;   // Private: Error Thrown
  /**
   * @type {Object.<string, Array.<string>>} Global Error Message strings
   */
  #errors;  // Private: Global Error Message strings
  /**
   * @type {TextChannel | any} Channel to send embeds to
   */
  #channel;   // Private: Channel to send VillainsEmbed to
  /**
   * @type {string} Channel to send embeds to
   */
  #channelName;   // Private: Channel to send VillainsEmbed to
  /**
   * @type {Object.<string, any>} Processed input data
   */
  #inputData; // Private: Command Inputs

  /**
   * @typedef {Object} EmbedField
   * @property {string} name Field Name
   * @property {string} value Field Value
   * @property {boolean} inline Inline?
   */
  /**
   * @typedef {Object} Player Player
   * @property {string} name The name
   * @property {string} url The URL
   * @property {string} avatar The Avatar
   */
  /**
   * @typedef {Object.<string, any>} EmbedProps       Embed Properties
   * @property {boolean}            full              Print Full Embed
   * @property {string}             color             Stripe color
   * @property {{text: string}}     caption           Caption text
   * @property {{text: string, url: string}}  title   Title text & url
   * @property {string}             thumbnail         Thumbnail url
   * @property {string}             description       Body text
   * @property {Array.<EmbedField>} fields            Embed Fields
   * @property {string}             image             Body Image
   * @property {{msg: string, image: string}} footer  Footer text & image
   * @property {number | boolean}   timestamp         Timestamp for footer
   * @property {boolean}            error             Print error format
   * @property {{bot: Player, user: Player, target: Player}} players  Players
   */

  /**
   * Constructor
   * @param {Object.<string, any>} comprops List of command properties from child class
   * @param {EmbedProps} props              Local list of command properties
   */
  constructor(comprops = {}, props = {}) {
    this.name                 = comprops?.name                ? comprops.name.toLowerCase()     : "unknown"
    this.category             = comprops?.category            ? comprops.category.toLowerCase() : "unknown"
    this.description          = comprops?.description         ? comprops.description            : (this.name.charAt(0).toUpperCase() + this.name.slice(1))
    this.options              = comprops?.options             ? comprops.options                : []
    this.testOptions          = comprops?.testOptions         ? comprops.testOptions            : []
    this.channelName          = comprops?.channelName         ? comprops.channelNames           : "bot-console"
    this.access               = comprops?.access              ? comprops.access                 : "unset"
    this.permissionsRequired  = comprops?.permissionsRequired ? comprops.permissionsRequired    : []
    this.botPermissions       = comprops?.botPermissions      ? comprops.botPermissions         : []

    // Build profile
    this.getProfile()

    /**
     * Embed Properties
     * @type {EmbedProps}
     */
    this.props = {...props}

    /**
     * Force full Embed
     * @type {boolean}
     */
    if (!(this?.props?.full)) {
      this.props.full = true
    }

    // Ephemeral Message
    if (!(this?.props?.ephemeral)) {
      this.ephemeral = false
    }

    // Caption text & emoji
    if (this?.props?.caption?.text) {
      if (this.props.caption?.emoji) {
        this.props.caption.text = `${this.props.caption.emoji} ${this.props.caption.text}`
      }
    }

    // Title
    if (!(this?.props?.title)) {
      this.props.title = {}
    } else if (props?.title) {
      this.props.title = props.title
    }

    // Description
    let undefDesc = (!(this?.props?.description))
    let emptyDesc = (!(undefDesc)) &&  (typeof this.props.description === "object")
    let noDesc = (!(undefDesc)) && (this.props.description.trim() == "")
    // Default description
    if (undefDesc || emptyDesc || noDesc) {
      this.props.description = ""
    }
    // Default footer
    if (!(this?.props?.footer)) {
      this.props.footer = {}
    }
    // Default players
    if (!(this?.props?.players)) {
      this.props.players = {}
    }
    // Default flags
    if (!(comprops?.flags)) {
      this.flags = {}
    } else {
      this.flags = comprops.flags
    }

    // Set flags for players
    for (let [player, setting] of Object.entries({user:"default",target:"optional",bot:"invalid",search:"valid"})) {
      if (!(Object.keys(this.flags).includes(player))) {
        this.flags[player] = setting
      }
    }

    // Set null if we're not actually printing a thing
    if (this?.props?.null && this.props.null) {
      this.null = true
    }

    /**
     * List of pages of Embeds
     * @type {Array.<(RookEmbed | SlimEmbed)>}
     */
    this.pages = []

    /**
     * Print Error
     * @type {boolean}
     */
    this.error = false

    /**
     * Global Error Strings
     * @type {Object.<string, Array.<string>>}
     */
    this.errors = JSON.parse(fs.readFileSync("./src/dbs/errors.json", "utf8"))

    /** @type {Object.<string, any>} Data gathered from input management */
    this.inputData = {}

    // Bail if we fail to get error message information
    if (!(this.errors)) {
      this.error = true
      this.props.description = "Failed to get error message information."
      return
    }
  }

  // DEV Mode
  get DEV() {
    return this.#DEV
  }
  set DEV(DEV) {
    this.#DEV = DEV
  }

  // Ephemeral
  get ephemeral() {
    return this.#ephemeral
  }
  set ephemeral(ephemeral) {
    this.#ephemeral = ephemeral
  }
  // Independent
  get independent() {
    return this.#independent
  }
  set independent(independent) {
    this.#independent = independent
  }

  // Full props
  get props() {
    return this.#props
  }
  set props(props) {
    this.#props = props
  }

  // Embed pages
  get pages() {
    return this.#pages
  }
  set pages(pages) {
    this.#pages = pages
  }

  // Input Flags
  get flags() {
    return this.#flags
  }
  set flags(flags) {
    this.#flags = flags
  }

  // Error Mode
  get error() {
    return this.#error
  }
  set error(error) {
    this.#error = error
  }

  // List of errors
  get errors() {
    return this.#errors
  }
  set errors(errors) {
    this.#errors = errors
  }

  // Channel object
  get channel() {
    return this.#channel
  }
  set channel(channel) {
    this.#channel = channel
  }

  // Channel name
  get channelName() {
    return this.#channelName
  }
  set channelName(channelName) {
    this.#channelName = channelName
  }

  // argv
  get inputData() {
    return this.#inputData
  }
  set inputData(inputData) {
    this.#inputData = inputData
  }

  /**
   * Get Profile data from loaded profile
   */
  async getProfile() {
    let profileName = "default"
    try {
      /**
       * Global properties
       * @type {Object.<string, any>}
       */
      this.defaults = JSON.parse(fs.readFileSync("./src/dbs/defaults.json", "utf8"))
      if (fs.existsSync("./src/PROFILE.json")) {
        this.GLOBALS = JSON.parse(fs.readFileSync("./src/PROFILE.json", "utf8"))
      } else {
        console.log("🟡RCommand: PROFILE manifest not found! Using defaults!")
      }
      if (
        this.GLOBALS?.selectedprofile &&
        this.GLOBALS?.profiles &&
        this.GLOBALS.selectedprofile in this.GLOBALS.profiles
      ) {
        profileName = this.GLOBALS.selectedprofile
        this.GLOBALS = this.GLOBALS.profiles[this.GLOBALS.selectedprofile]
      } else {
        this.GLOBALS = this.defaults
      }
    } catch(err) {
      console.log("🔴RCommand: PROFILE manifest not found!")
      console.log(err.stack)
      process.exit(1)
    }

    try {
      /**
       * Package properties
       * @type {Object.<string, any>}
       */
      this.PACKAGE = JSON.parse(fs.readFileSync("./package.json","utf8"))
      if (this?.PACKAGE) {
        this.PACKAGE.profileName = profileName
      }
    } catch(err) {
      console.log("🔴RCommand: PACKAGE manifest not found!")
      process.exit(1)
    }

    this.DEV = process.env.ENV_ACTIVE === "development"

    // Bail if we fail to get server profile information
    if (!this.GLOBALS) {
      this.error = true
      this.props.description = "Failed to get server profile information."
      return
    }
    // Bail if we fail to get bot default information
    if (!this.defaults) {
      this.error = true
      this.props.description = "Failed to get bot default information."
      return
    }
  }

  /**
   * Get Channel object based on general key name
   * @param {string} channelType Key for channel to get from database
   */
  async getChannel(client, interaction, channelType) {
    // Get botdev-defined list of channelIDs/channelNames
    let guildID = interaction?.guild?.id || process.env.GUILD_ID
    let channelIDs = {}
    let channelID = this.channelName
    let guild = interaction?.guild || await client.guilds.cache.find(g => g.id === guildID)
    let channel = null

    try {
      channelIDs = JSON.parse(fs.readFileSync(`./src/dbs/${guildID}/channels.json`,"utf8"))
    } catch(err) {
      console.log(err.stack)
    }

    if (channelIDs) {
      // Get channel IDs for this guild
      if (Object.keys(channelIDs).includes(guildID)) {
        // If the channel type exists
        if (Object.keys(channelIDs[guildID]).includes(channelType)) {
          // Get the ID
          channelID = channelIDs[guildID][channelType]
        }
      }
    }

    // If the ID is not a number, search for a named channel
    if (typeof channelID == "string") {
      channel = await guild.channels.cache.find(c => c.name === channelID)
    } else {
      // Else, search for a numbered channel
      channel = await guild.channels.cache.find(c => c.id === channelID)
    }

    return channel
  }

  /**
   * Return emoji if present, otherwise return emoji name
   * @param {string} emojiKey
   * @returns {Promise.<string>}
   */
  async getEmoji(emojiKey, emojis=null) {
    let ret = ""

    let emojiName = emojiKey
    if (emojiName == "val") {
      emojiName = "valorant"
    }

    let foundEmoji = false

    if (emojis) {
      // @ts-ignore
      let cachedEmoji = await emojis.cache.find(emoji => emoji.name === emojiName)
      if (cachedEmoji?.available) {
        foundEmoji = true
        ret += `${cachedEmoji}`
      }
    }

    if (!foundEmoji) {
      if (emojiKey) {
        ret += `[${emojiKey}]`
      }
    }

    return ret
  }

  /**
   * Sanitizes input for Markdown
   * @param {string} input String to sanitize
   * @returns {Promise.<string>}
   */
  async sanitizeMarkdown(input) {
    let output = input.replace(/[\*\_\~\`]/g, '\\$&')
    return output
  }

  /**
   *
   * @param {Object.<string, string>} flags Flags for user management
   */
  async processArgs(
    client,
    interaction,
    flags = { user: "default", target: "invalid", bot: "invalid", search: "valid" },
    options
  ) {
    let foundHandles  = { players: {}, invalid: "", flags: flags }
    let user          = null
    let mention       = null
    let search        = null
    let loaded        = null

    // Different entities
    let entities = {}
    entities.discord = {
      id: "0",
      name: "Discord",
      avatar: "https://cdn.iconscout.com/icon/free/png-512/free-discord-logo-icon-download-in-svg-png-gif-file-formats--social-media-pack-logos-icons-3073764.png?f=webp&w=256",
      username: "discord",
      discriminator: "0"
    }

    let client_user = await interaction?.guild?.members.fetch(interaction.client.user.id) || interaction?.client.user || client.user
    entities.bot = {
      id:             client_user.id,
      name:           client_user?.nickname || client_user.displayName || client_user.id,
      avatar:         client_user.displayAvatarURL(),
      username:       client_user.id,
      discriminator:  client_user.discriminator
    }

    // Get User issuing command
    // {Message} message
    if (interaction?.author) {
      user = interaction.author
    }
    // {Interaction} message
    // @ts-ignore
    if (interaction?.user) {
      // @ts-ignore
      user = interaction.user
    }
    // @ts-ignore
    user = await interaction?.guild?.members.fetch(user.id)

    // If we've got a user, set as author
    if (user) {
      entities.author = {
        id:             user.id,
        name:           user?.nickname            || user?.displayName,
        avatar:         user?.displayAvatarURL()  || user?.user.displayAvatarURL(),
        username:       user?.user.username,
        discriminator:  user?.user.discriminator
      }
    }

    // If we've got mentions, set as mention
    if (interaction?.mentions) {
      mention = interaction?.mentions?.members?.first()
      if (mention) {
        mention = await interaction?.guild?.members.fetch(mention.id)
        if (mention) {
          entities.mention = {
            id:             mention.id,
            name:           mention?.nickname           || mention?.displayName,
            avatar:         mention?.displayAvatarURL() || mention?.user.displayAvatarURL(),
            username:       mention?.user.username,
            discriminator:  mention?.user.discriminator
          }
        }
      }
    }

    let padding = 9
    let debugout = [ `Flags:`.padEnd(padding) + JSON.stringify(flags) ]

    // If we have a User
    if (user) {
      // Load the User as the Target
      // Set the User Player
      loaded = entities.author
      foundHandles.user = loaded
      foundHandles.loadedType = "user"
      foundHandles.players.user = loaded
      // debugout.push(`User:`.padEnd(padding) + `<@${loaded.id}>`)
      debugout.push(`User:`.padEnd(padding) + `${loaded.username}`)
    }

    // If we have a Mention
    if (mention) {
      // Load the Mention as the Target
      loaded = entities.mention
      foundHandles.mention = loaded
      foundHandles.loadedType = "mention"
      // debugout.push(`Mention:`.padEnd(padding) + `<@${loaded.id}>`)
      debugout.push(`Mention:`.padEnd(padding) + `${loaded.username}`)
    }

    // If we got stuff to Search for
    if (search) {
      // We already ran the search
      // @ts-ignore
      let tmp = search?.size > 0
      // If there's results, get the first result
      // Otherwise, just gracefully degrade to our current Target
      // @ts-ignore
      loaded = tmp ? search?.first() : loaded
      if (tmp && loaded) {
        // @ts-ignore
        if (loaded?.nickname) {
          // @ts-ignore
          debugout.push(`Terms:`.padEnd(padding) + `[Nick:${loaded.nickname}] [UName:${loaded.user.username}]`)
        }
        foundHandles.search = loaded
        foundHandles.loadedType = "search"
        // debugout.push(`Search:`.padEnd(padding) + `<@${loaded.id}>`)
        debugout.push(`Search:`.padEnd(padding) + `${loaded.username}`)
      }
    }
    debugout.push(`Type:`.padEnd(padding) + `${foundHandles.loadedType}`)

    // If we have calculated a Target
    if (loaded) {
      // Make sure Loaded isn't from an Invalid source
      for (let handleType of ["mention", "search", "user", "target"]) {
        if ((foundHandles.loadedType == handleType) && (this.flags[handleType] == "invalid")) {
          foundHandles.invalid = handleType
        }
      }
      if (this.flags.user == "invalid" && loaded.id == user?.id) {
        foundHandles.invalid = "user"
      }

      // If Loaded is a Bot
      // If Bot has been specified as a Valid source
      // Get Bot whitelist
      let USERIDS = {}
      try {
        USERIDS = JSON.parse(fs.readFileSync("./src/dbs/userids.json","utf8"))
      } catch {
        // Bail if we fail to get UserIDs list
        this.error = true
        this.props.description = "Failed to get UserIDs list."
        return
      }
      // Fake an empty Bot Whitelist
      if (!(USERIDS?.botWhite)) {
        USERIDS["botWhite"] = []
      }
      if (["default","required","optional"].includes(this.flags.bot)) {
        // Do... something?
      } else if (loaded?.bot && loaded.bot && (!(USERIDS?.botWhite.includes(loaded.id)))) {
        // If Bot has been specified as in Invalid source
        // Set Invalid because Bot
        foundHandles.invalid = "bot"
      }

      foundHandles.loaded = loaded

      // Set Loaded as Target Player
      if (foundHandles.invalid == "") {
        foundHandles.players.target = loaded
      }
      // debugout.push(`Loaded:`.padEnd(padding) + `<@${loaded.id}>`)
      debugout.push(`Loaded:`.padEnd(padding) + `${loaded.username}`)
    }

    debugout.push(`Invalid:`.padEnd(padding) + `${foundHandles.invalid}`)

    if (this.DEV && false) {
      console.log("---")
      console.log(debugout.join("\n"))
    }

    // Errors based on Invalid Source
    if (foundHandles?.invalid && foundHandles.invalid != "") {
      this.error = true
      foundHandles.title = { text: "Error" }
      switch (foundHandles.invalid) {
        case "user":
          foundHandles.description = this.errors.cantActionSelf.join("\n")
          break
        case "target":
          foundHandles.description = this.errors.cantActionOthers.join("\n")
          break
        case "bot":
          foundHandles.description = this.errors.cantActionBot.join("\n")
          break
        case "mention":
          foundHandles.description = this.errors.cantActionMention.join("\n")
          break
        case "search":
          foundHandles.description = this.errors.cantActionSearch.join("\n")
          break
        default:
          break
      }
    }

    this.inputData          = foundHandles
    this.props.entities     = entities
    this.props.players      = foundHandles.players
    this.props.title        = foundHandles?.title ? foundHandles.title : this.props.title
    this.props.description  = foundHandles?.description ? foundHandles.description : this.props.description

    // console.log(this.props)
  }

  /**
   * Execute command and build embed
   *
   * @param {Client} client Discord Client object
   * @param {string} cmd Command name/alias sent
   */
  async action(client, interaction, cmd, options) {
    // Do nothing; command overrides this
    // If the thing doesn't modify anything, don't worry about DEV flag
    // If the thing does modify stuff, use DEV flag to describe action instead of performing it
    if(! this.DEV) {
      // Do the thing
    } else {
      // Describe the thing
    }

    return !this.error
  }

  /**
   * Build pre-flight characteristics of Command
   *
   * @param {Client} client Discord Client object
   */
  async build(client, interaction, cmd, options) {
    this.channel = await this.getChannel(client, interaction, this.channelName)

    let actionResult = false

    if(!(this.error)) {
      // Process arguments
      await this.processArgs(
        client,
        interaction,
        this.flags,
        options
      )

      for (let option of this.options) {
        if (!(options.hasOwnProperty(option.name))) {
          // @ts-ignore
          let thisOption = interaction.options.get(option.name)
          if (thisOption) {
            options[option.name] = thisOption.value
          }
        }
      }

      actionResult = await this.action(
        client,
        interaction,
        cmd,
        options
      )
    }

    return actionResult && !this.error
  }

  /**
   * Send pages to Discord Client
   *
   * @param {Array.<(RookEmbed)> | RookEmbed} pages Pages to send to client
   * @param {Array.<string>} emojis Emoji for pagination
   * @param {number} timeout Timeout for disabling pagination
   * @param {boolean} forcepages Force pagination
   */
  // @ts-ignore
  async send(
    interaction,
    pages       = [new RookEmbed({"description":"No pages sent!"})],
    execOptions = {},
    emojis      = [],
    timeout     = 600000,
    forcepages  = false
  ) {
    if ((!this.channel) && interaction) {
      this.channel = interaction.channel
    }
    // If pages are being forced, set defaults
    if (forcepages) {
      emojis  = []
      timeout = 600000
    }
    let flags = 0
    if (this.ephemeral) {
      flags = MessageFlags.Ephemeral
    }
    if (execOptions?.independent && execOptions.independent) {
      // flags = 1337
    }

    let reply = null
    let needsDeferred = (interaction?.deferred && !interaction.deferred)
    let needsReplied = (interaction?.replied && !interaction.replied)
    try {
      if (interaction) {
        if (needsDeferred && needsReplied) {
          console.log(`/${this.name} Send: Deferring reply`)
          await interaction.deferReply()
        }
        if (!needsReplied) {
          console.log(`/${this.name} Send: Fetching reply`)
          reply = await interaction.fetchReply()
        }
      } else {
        console.log(`/${this.name} Send: No Interaction to defer?`)
      }
    } catch(err) {
      console.log(`/${this.name} Send: Failed to defer Reply?`)
      if (!err.stack.contains("10062")) {
        console.log(err.stack)
      }
    }

    let destination = ""

    // If we have an array of page(s)
    if (Array.isArray(pages)) {
      // If it's just one and we're not forcing pages, just send the embed
      if ((pages.length <= 1) && !forcepages) {
        if (pages[0]?.ephemeral) {
          flags = MessageFlags.Ephemeral
        }
        let this_page = {
          content:  "",
          embeds:   [ pages[0] ],
          flags:    flags
        }
        if (interaction) {
          destination = "" +
            "'" +
            `${interaction.guild.name} (${interaction.guild.id})` +
            "/" +
            `${interaction.channel.name} (${interaction.channel.id})` +
            "/" +
            `${reply.id}` +
            "'" +
            "/" +
            `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${reply.id}`
          if (flags == 0) {
            console.log(`/${this.name}: Editing embed at ${destination}`)
            return interaction.editReply(this_page)
          } else if (execOptions?.independent && execOptions.independent) {
            console.log(`/${this.name}: Reply embed to ${destination}`)
            return reply.reply(this_page)
          } else {
            console.log(`/${this.name}: Follow-up embed to ${destination}`)
            return interaction.followUp(this_page)
          }
        } else {
          destination = "" +
            `'${this.channel.guild.name} (${this.channel.guild.id})` +
            "/" +
            `${this.channel.name} (${this.channel.id})'` +
            "/" +
            `https://discord.com/channels/${this.channel.guild.id}/${this.channel.id}`
          console.log(`/${this.name}: Sending embed to ${destination}`)
          return this.channel.send(this_page)
        }
      } else {
        // Else, set up for pagination
        // Sanity check for emoji pageturners
        let filler = "🤡"
        if (emojis.length !== 2) {
          if (emojis.length == 1) {
            emojis.push(filler)
          } else if (emojis.length >= 3) {
            emojis = emojis.slice(0,2)
          }
        }
        if (emojis[0] == emojis[1]) {
          emojis = emojis.slice(0,1)
          emojis.push(filler)
        }

        // Send the pages
        // @ts-ignore
        let these_pagination = await new Pagination(interaction)
        these_pagination.setOptions( { idle: timeout } )
        // these_pages.setEmojis({
        //   firstEmoji: emojis[0],
        //   prevEmoji:  emojis[1],
        //   nextEmoji:  emojis[2],
        //   lastEmoji:  emojis[3]
        // })
        these_pagination.setEmbeds(
          pages,
          (page, index, array) => {
            let footer_text = page.toJSON()?.footer?.text
            if(footer_text) {
              footer_text = " • " + footer_text
            }
            return page.setFooter(
              {
                text: `Page: ${index + 1}/${array.length}${footer_text}`
              }
            )
          }
        )
        these_pagination.render()
        if (these_pagination[0]?.ephemeral) {
          flags = MessageFlags.Ephemeral
        }
        let these_pages = {
          content:  "_",
          embeds:   [ these_pagination ],
          flags:    flags
        }
        if (interaction) {
          let reply = await interaction.fetchReply()
          destination = "" +
            "'" +
            `${interaction.guild.name} (${interaction.guild.id})` +
            "/" +
            `${interaction.channel.name} (${interaction.channel.id})` +
            "/" +
            `${reply.id}` +
            "'" +
            "/" +
            `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${reply.id}`
          if (flags == 0) {
            console.log(`/${this.name}: Editing pages at ${destination}`)
            return interaction.editReply(these_pages)
          } else if (execOptions?.independent && execOptions.independent) {
            console.log(`/${this.name}: Reply pages to ${destination}`)
            // return reply.reply(these_pages)
            reply.reply(these_pages)
            console.log("Sent!")
          } else {
            console.log(`/${this.name}: Follow-up pages to ${destination}`)
            return interaction.followUp(these_pages)
          }
        } else {
          destination = "" +
            `'${this.channel.guild.name} (${this.channel.guild.id})` +
            "/" +
            `${this.channel.name} (${this.channel.id})'` +
            "/" +
            `https://discord.com/channels/${this.channel.guild.id}/${this.channel.id}`
          console.log(`/${this.name}: Sending pages to '${this.channel.guild.name} (${this.channel.guild.id})/${this.channel.name} (${this.channel.id})'/ https://discord.com/channels/${this.channel.guild.id}/${this.channel.id}`)
          return this.channel.send(these_pages)
        }
      }
    } else {
      // Else, it's just an embed, send it
      if (pages[0]?.ephemeral) {
        flags = MessageFlags.Ephemeral
      }
      let this_embed = {
        content:  "",
        embeds:   [ pages ],
        flags:    flags
      }
      if (interaction) {
        let reply = await interaction.fetchReply()
        destination = "" +
          "'" +
          `${interaction.guild.name} (${interaction.guild.id})` +
          "/" +
          `${interaction.channel.name} (${interaction.channel.id})` +
          "/" +
          `${reply.id}` +
          "'" +
          "/" +
          `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${reply.id}`
        if (flags == 0) {
          console.log(`/${this.name}: Editing embed page at ${destination}`)
          return interaction.editReply(this_embed)
        } else if (execOptions?.independent && execOptions.independent) {
          console.log(`/${this.name}: Reply embed page to ${destination}`)
          return reply.reply(this_embed)
        } else {
          console.log(`/${this.name}: Follow-up embed page to ${destination}`)
          return interaction.followUp(this_embed)
        }
      } else {
        destination = "" +
          `'${this.channel.guild.name} (${this.channel.guild.id})` +
          "/" +
          `${this.channel.name} (${this.channel.id})'` +
          "/" +
          `https://discord.com/channels/${this.channel.guild.id}/${this.channel.id}`
        console.log(`/${this.name}: Sending embed page to ${destination}`)
        return this.channel.send(this_embed)
      }
    }
  }

  /**
   * Run the command
   *
   * @param {Client} client Discord Client object
   * @param {string} cmd Actual command name used (alias here if alias used)
   * @returns {Promise.<any>}
   */
  // @ts-ignore
  async execute(
    client,
    interaction=null,
    cmd="",
    options={},
    execOptions={}
  ) {
    let reply = null

    // @ts-ignore
    if (interaction?.id) {
      // @ts-ignore
      let needsDeferred = (!interaction?.deferred) || (interaction?.deferred && !interaction.deferred)
      // @ts-ignore
      let needsReplied = (!interaction?.replied) || (interaction?.replied && !interaction.replied)
      console.log("Execute: Defer Needed:", needsDeferred)
      console.log("Execute: Has Replied:", !needsReplied)
      if (needsDeferred && needsReplied) {
        console.log(`/${this.name} Test: Deferring reply`)
        // @ts-ignore
        await interaction.deferReply()
      }
      if (!needsReplied) {
        console.log(`/${this.name} Test: Fetching reply`)
        // @ts-ignore
        reply = await interaction.fetchReply()
      }
    }

    if (!execOptions?.skipBody) {
      try {
        // Build the thing
        let buildResult = await this.build(client, interaction, cmd, options)
      } catch(err) {
        console.log(err.stack)
      }
    }

    // If we have an error, make it errortastic
    if (this.error) {
      if (this.props?.title) {
        this.props.title.text = "Error"
      } else if (this.props?.caption) {
        this.props.caption.text = "Error"
      }
    }

    // If we just got an embed, let's check to see if it's a full page or slim page
    // Toss it in pages as a single page
    if(this.pages.length == 0) {
      if(this.props?.full && this.props.full) {
        // @ts-ignore
        this.pages.push(new RookEmbed({...this.props}))
      } else {
        // @ts-ignore
        this.pages.push(new SlimEmbed({...this.props}))
      }
    }

    // this.null is to be set if we've already sent the page(s) somewhere else
    // Not setting this.null after sending the page(s) will send the page(s) again
    if ((!(this?.null)) || (this?.null && (!(this.null)))) {
      try {
        await this.send(interaction, this.pages, execOptions)
      } catch(e) {
        // do nothing
      }
    }
  }

  async test(client, interaction, cmd) {
    let reply = null

    let needsDeferred = (interaction?.deferred && !interaction.deferred)
    let needsReplied = (interaction?.replied && !interaction.replied)
    console.log("Defer Needed:", needsDeferred)
    console.log("Has Replied:", !needsReplied)
    if (needsDeferred && needsReplied) {
      console.log(`/${this.name} Test: Deferring reply`)
      await interaction.deferReply()
    }
    if (!needsReplied) {
      console.log(`/${this.name} Test: Fetching reply`)
      reply = await interaction.fetchReply()
    }
    if (this.testOptions.length > 0) {
      let i = 0
      for (let thisTest of this.testOptions) {
        let buildResult = await this.build(
          client,
          interaction,
          cmd,
          thisTest
        )
        if (this.testOptions.hasOwnProperty("assert")) {
          if (buildResult != this.testOptions.assert) {
            this.props.error = true
          }
        }

        // If we have an error, make it errortastic
        if (this.error) {
          if (this.props?.title) {
            this.props.title.text = "Error"
          } else if (this.props?.caption) {
            this.props.caption.text = "Error"
          }
        }

        // if ((!this.props?.description) || this.props.description.trim() == "") {
        //   this.props.description = "** **"
        // }

        this.pages.push(new RookEmbed({...this.props}))

        i += 1
      }

      console.log(`/${this.name} Test:`,"Pages being sent", this.pages.length)

      // this.null is to be set if we've already sent the page(s) somewhere else
      // Not setting this.null after sending the page(s) will send the page(s) again
      if ((!(this?.null)) || (this?.null && (!(this.null)))) {
        try {
          await this.send(
            interaction,
            this.pages,
            { independent: i != 0 }
          )
        } catch(e) {
          // do nothing
        }
      }
    } else {
      await this.execute(client, interaction, cmd)

      // this.props.title = {text: `/${this.name}: Test`}
      // this.props.description = ""
      // console.log(this.props.title.text)
      // this.execute(client, interaction, cmd, [])
    }
  }
}

exports.RookCommand = RookCommand
