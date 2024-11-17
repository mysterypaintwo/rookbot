import shell from 'shelljs'

shell.exec("node ./src/res/ci/common/ver.js")
console.log()

shell.exec("node ./src/res/ci/common/npm/audit.js")
console.log()

shell.exec("node ./src/res/ci/common/npm/outdated.js")

let TRACE_WARNINGS = false
let UNHANDLED_REJECTIONS = false

let command = "node "
if (TRACE_WARNINGS) {
  command += "--trace-warnings "
}
if (UNHANDLED_REJECTIONS) {
  command += "--unhandled-rejections=strict "
}
command += "./src/index.js"

shell.exec(command)
