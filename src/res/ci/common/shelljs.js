import shell from 'shelljs'

for(let module of [
  "node",
  "npm",
  "discord.js"
]) {
  if ([
    "node",
    "npm"
  ].includes(module)) {
    let tmp = shell.exec(
      `${module} -v`,
      { silent: true }
    )
    let msg = tmp.stdout.trim()
    if (msg.startsWith("v") === false) {
      msg = "v" + msg
    }
    console.log(module, msg)
  } else {
    let npm_list = shell.exec(
      `npm list ${module} --depth=0`,
      { silent: true }
    )
    let listing = npm_list.stdout.trim()
    let matches = listing.match(`${module}@(.*)`)
    let version = ""
    if (matches) {
      version = matches[1]
    }
    let msg = version
    if (msg.startsWith("v") === false) {
      msg = "v" + msg
    }
    console.log(module, msg)
  }
}
