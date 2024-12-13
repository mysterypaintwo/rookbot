const { EmbedBuilder } = require('discord.js')
const fs = require('fs')

/**
 * @class
 * @classdesc Build a Villains-branded Embed
 * @this {RookEmbed}
 * @extends {EmbedBuilder}
 * @public
 */
class RookEmbed extends EmbedBuilder {
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
   * @typedef {Object} EmbedProps Embed Properties
   * @property {boolean}                      full                    Print Full Embed
   * @property {string}                       color                   Stripe color
   * @property {{text: string}}               caption                 Caption text
   * @property {{text: string, url: string}}  title                   Title text & url
   * @property {string}                       thumbnail               Thumbnail url
   * @property {string}                       description             Body text
   * @property {Array.<EmbedField>}           fields                  Embed Fields
   * @property {string}                       image                   Body Image
   * @property {{msg: string, image: string}} footer                  Footer text & image
   * @property {number | boolean}             timestamp               Timestamp for footer
   * @property {boolean}                      error                   Print error format
   * @property {{bot: Player, user: Player, target: Player}} players  Players
   */

  async init(client, props) {
    this.GLOBALS = await client.profile

    if (
      (!(props?.color)) ||
      (props?.color && props.color.trim() == "")
    ) {
      switch (props?.color) {
        default:
          this.props.color = this?.defaults?.stripe
          break
      }
    // } else {
    //   this.props.color = this.defaults.stripe
    }

    // Inbound footer message
    let haveFooterMsg = props?.footer?.msg

    // Inbound footer message and not "<NONE>"
    let footerMsgNotNone = haveFooterMsg && (props.footer.msg.trim() != "") && (props.footer.msg.trim() != "<NONE>")

    // Hack in my stuff to differentiate
    if (
      this.DEV &&
      this.GLOBALS?.stripe &&
      this.GLOBALS?.footer
    ) {
      // Custom user footer
      this.props.color = this.GLOBALS.stripe
      this.props.footer = this.GLOBALS.footer
      this.setTimestamp()
    } else if(
      (!haveFooterMsg) ||
      (haveFooterMsg && (!footerMsgNotNone))
    ) {
      // Default footer
      if (this.GLOBALS?.footer) {
        this.props.footer = this.GLOBALS.footer
      }
    }

    // Stripe
    this.setColor(this.props.color || "#000000")

    if (props?.footer?.msg) {
      if (!(props.footer.msg.includes(this.GLOBALS.PACKAGE?.version))) {
        props.footer.msg += ` [v${this.GLOBALS.PACKAGE?.version}]`
      }
      this.setFooter(
        {
          text: props.footer.msg,
          iconURL: props.footer.image
        }
      )
    }

  }

  /**
   * Constructor
   * @param {(EmbedProps | Object.<any>)} props Local list of command properties
   */
  constructor(client, props = {}) {
    // If we've got no title, set default
    if (
      (
        (!(props?.title?.text)) ||
        (props?.title?.text && (props.title.text.trim() == "" || props.title.text.trim() == "<NONE>"))
      ) &&
      (props?.title?.url && props.title.url.trim() != "")
    ) {
      props.title.text = "Source"
    }
    // If the description is an array, join it with newlines
    if (props?.description && Array.isArray(props.description)) {
      props.description = props.description.join("\n")
    }
    // Get description figured out
    // All Hail the Bold Space
    let noDesc    = (!(props?.description))
    let undefDesc = (typeof props.description === "undefined")
    let nullDesc  = (!(noDesc || undefDesc)) && (! props?.description)
    if (noDesc || undefDesc || nullDesc) {
      props.description = "** **"
    }
    if (typeof props.timestamp === undefined) {
      props.timestamp = true
    }


    super()

    this.props = {}

    /**
     * Development Mode?
     * @type {boolean}
     */
    this.DEV = process.env.ENV_ACTIVE === "development"

    // Inbound footer message
    let haveFooterMsg = props?.footer?.msg

    // Inbound footer message and not "<NONE>"
    let footerMsgNotNone = haveFooterMsg && (props.footer.msg.trim() != "") && (props.footer.msg.trim() != "<NONE>")

    // We've got pages
    let havePages = props?.pages

    // Footer
    if(footerMsgNotNone) {
      // If we have an inbound footer
      if(this.DEV || havePages) {
        // If we need to repurpose the footer
        // Append sent footer message to description
        if(this.props.description != "") {
          this.props.description += "\n\n"
        }
        this.props.description += `>>${props.footer.msg}`
      }
    }

    // ERROR
    if (
      (props.error) ||
      (props?.title?.text && props.title.text.toLowerCase().includes("error")) ||
      (props?.description && props.description.toLowerCase().includes("***error***"))
    ) {
      this.props.color = "#ff0000" // RED
    }

    // Avatars
    //  Default: Bot as Thumbnail
    //  Custom Thumbnail: Bot as Author
    //  Custom Thumbnail & Custom Author: No Bot

    let bot = {
      name: "Bot",
      avatar: client.profile?.defaults?.thumbnail.trim()
    }
    if (!(props?.players)) {
      props.players = {
        bot: bot
      }
    } else if (!(props?.players?.bot)) {
      props.players.bot = bot
    }

    let avatars = {
      bot: {
        type: "bot",
        name: props.players.bot.name,
        url: props?.players?.bot?.url && props.players.bot.url.trim() != "" ? props.players.bot.url.trim() : "http://example.com/bot",
        avatar: props.players.bot.avatar
      },
      user: {
        type: "user",
        name: props?.players?.user?.name && props.players.user.name.trim() != "" ? props.players.user.name.trim() : "",
        url: props?.players?.user?.url && props.players.user.url.trim() != "" ? props.players.user.url.trim() : "http://example.com/user",
        avatar: props?.players?.user?.avatar && props.players.user.avatar.trim() != "" ? props.players.user.avatar.trim() : ""
      },
      target: {
        type: "target",
        name: props?.players?.target?.name && props.players.target.name.trim() != "" ? props.players.target.name.trim() : "",
        url: props?.players?.target?.url && props.players.target.url.trim() != "" ? props.players.target.url.trim() : "http://example.com/target",
        avatar: props?.players?.target?.avatar && props.players.target.avatar.trim() != "" ? props.players.target.avatar.trim() : ""
      },
      thumbnail: {},
      author: { name: "" }
    }

    // Default; put Bot in Thumbnail
    avatars.thumbnail = avatars.bot

    // Have a User, move Bot to Author
    if(avatars.user.avatar != "") {
      avatars.author = avatars.bot
      avatars.thumbnail = avatars.user

      if(avatars.target.avatar != "") {
        // Have a Target, move User to Author
        avatars.author = avatars.user
        avatars.thumbnail = avatars.target
      }
    }

    // Easter Eggs
    // Set stripe based on user
    let eggs = require('../../dbs/eggs.json')

    if (props?.players?.user?.username) {
      if (eggs[props.players.user.username]) {
        this.props.color = eggs[props.players.user.username]
      }
    }

    // Ephemeral
    if(props?.ephemeral && props.ephemeral) {
      this.ephemeral = props.ephemeral
    }

    // Title
    if(props?.title?.text && props.title.text.trim() != "" && props.title.text.trim() != "<NONE>") {
      if(props?.ephemeral && props.ephemeral) {
        props.title.emoji = "🤫😶"
      }
      this.setTitle(
        (props.title?.emoji ? (props.title.emoji + " ") : "") +
        ((props?.ephemeral && props.ephemeral) ? "[YouPost] " : "") +
        props.title.text
      )
      if (props?.title?.url && props.title.url.trim() != "") {
        this.setURL(props.title.url.trim())
      }
    }

    // Author
    let author = {}
    author.name = props?.caption?.text && props.caption.text.trim() != "" ? props.caption.text.trim() : avatars.author.name
    author.url = props?.caption?.url && props.caption.url.trim() != "" ? props.caption.url.trim() : avatars.author.url
    if (author && author.name != "") {
      this.setAuthor(
        {
          name: author.name,
          iconURL: avatars.author.avatar,
          url: author.url
        }
      )
    }

    // Thumbnail
    this.setThumbnail(avatars.thumbnail.avatar)

    // Body Description
    this.setDescription(props.description)

    // Fields
    if (props?.fields?.length) {
      this.setFields(props.fields)
    }

    // Body Image
    if (props?.image != "") {
      this.setImage(props.image)
    }

    // Timestamp
    if(
      (!props?.timestamp) ||
      (
        (props?.timestamp && props.timestamp) &&
        (props?.timestamp && props.timestamp != "<NONE>")
      )
    ) {
      this.setTimestamp()
    }
  }
}

exports.RookEmbed = RookEmbed
