const { program } = require('commander')
const PACKAGE = require('./package.json')
const shell = require('shelljs')

console.log("")
console.log("dotenvx Runner:")
console.log(PACKAGE.name, "v" + PACKAGE.version)

program
  .name(PACKAGE.name)
  .version(PACKAGE.version)
  .usage("[OPTIONS]...")
  // Profile Name
  .option(
    "-p, --profile <profile>", "Profile name to load from PROFILE.json"
  )
  // Client ID
  .option(
    "-c, --client <username>", "Developer Client ID .env to load"
  )
  // User ID
  .option(
    "-u, --user <username>", "Developer User Token .env to load"
  )
  // Server ID
  .option(
    "-s, --server <username>", "Server Token .env to load"
  )
  // Long
  .option(
    "-l, --long", "Long?", false
  )
  // Environment: Development, Production
  .option(
    "-e, --environment <dev|prod>", "Environment to load",
    "development"
  )
  .parse(process.argv)

const options = program.opts()

console.log("Options:")
console.log(JSON.stringify(options, null, "  "))

// FIXME:
// Use ./node_modules/.bin/* if linux
// Use ./* if not linux

let dotenvx = shell.exec("which dotenvx", { silent: true })
let uname = shell.exec("uname", { silent: true })

let bin = dotenvx.stdout.trim()
console.log(bin)
if (bin.indexOf("WinGet") > -1 || uname.stdout.trim().indexOf("MINGW") > -1) {
  bin = "dotenvx"
}
let envs = ""
let args = []

if (options.client) {
  envs += `-f ./env/devs/.env.client.${options.client} `
}
if (options.user && !options.server) {
  envs += `-f ./env/devs/.env.token.${options.user} `
}
if (options.server && !options.user) {
  envs += `-f ./env/servers/.env.token.${options.server} `
}
if (options.environment) {
  let env = options.environment.startsWith("prod") ? "prod" : "dev"
  envs += `-f ./env/envs/.env.${env} `
}

if (options.long) {
  args.push("-l")
}
if (options.profile) {
  args.push(
    `-p ${options.profile}`
  )
}

let command = []
command.push(bin.trim())
command.push("run")
command.push(envs.trim())
command.push("--")
command.push("node ./run.js")
command.push(args.join(" "))
command = command.join(" ")

console.log("CLI Command:", command)
shell.exec(command)
