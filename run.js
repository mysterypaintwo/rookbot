require('@dotenvx/dotenvx').config()
const shell = require('shelljs')

let QUICK = !process.env.GITHUB_WORKFLOW

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
