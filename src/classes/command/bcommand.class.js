/**
 * @class
 * @classdesc Build a Base Command
 * @this {BaseCommand}
 * @public
 */
let command = class BaseCommand {
  constructor(comprops, props) {
    if (comprops["name"]) {
      this.name = comprops["name"]
    }
    if (comprops["description"]) {
      this.description = comprops["description"]
    }
  }

  /**
   * @type {string} Command Name
   */
  name;       // Command Name

  get name() {
    return this.name
  }
  set name(name) {
    this.name = name
  }

  /**
   * @type {string} Command Description
   */
  description;       // Command Description

  get description() {
    return this.description
  }
  set description(description) {
    this.description = description
  }
}

export default command
