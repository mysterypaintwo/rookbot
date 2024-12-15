module.exports = async (client) => {
  let cmd_defn = require('../../commands/app/hello')
  let cmd_obj = new cmd_defn(client)
  await cmd_obj.execute(client)
  return
}
