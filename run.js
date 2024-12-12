const { program } = require('commander')
const PACKAGE = require('./package.json')
const shell = require('shelljs')

program
  .name(PACKAGE.name)
  .version(PACKAGE.version)
  .usage("[OPTIONS]...")
  // Profile Name
  .option(
    "-l, --long", "Long?", false
  )
  .parse(process.argv)

const options = program.opts()
// console.log(JSON.stringify(options, null, "  "))

let QUICK = !options.long

if (!QUICK) {
  shell.exec("node ./src/res/ci/common/ver.js")
  console.log()

  shell.exec("node ./src/res/ci/common/npm/audit.js")
  console.log()

  shell.exec("node ./src/res/ci/common/npm/outdated.js")
}

let TRACE_WARNINGS = false
let TRACE_DEPRECATIONS = true
let UNHANDLED_REJECTIONS = false

let command = "node "
if (TRACE_WARNINGS) {
  command += "--trace-warnings "
}
if (TRACE_DEPRECATIONS) {
  command += "--trace-deprecation "
}
if (UNHANDLED_REJECTIONS) {
  command += "--unhandled-rejections=strict "
}
command += "./src/index.js"

shell.exec(command)
