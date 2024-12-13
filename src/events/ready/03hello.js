module.exports = async (client, profileName) => {
  let cmd_defn = require('../../commands/app/hello')
  let cmd_obj = new cmd_defn(client, profileName)
  await cmd_obj.execute(client)
  return
}
