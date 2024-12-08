const HelloCommand = require('../../commands/app/hello.js')

module.exports = async (client) => {
  const cmd = new HelloCommand()
  cmd.execute(client)
  return
}
