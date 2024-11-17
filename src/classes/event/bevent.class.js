let event = class BaseEvent {
  /**
   * @type {string} Event Name
   */
  #name;       // Event Name

  constructor(eventName="") {
    this.name = eventName
  }

  get name() {
    return this.#name
  }
  set name(name) {
    this.#name = name
  }
}

export default event
