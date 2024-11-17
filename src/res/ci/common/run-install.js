import shell from 'shelljs'

console.log("INSTALL 🔨")
console.log("==========")

shell.exec("node ./src/res/ci/common/ver.js")
console.log()

shell.exec("node ./src/res/ci/common/npm/outdated.js")
console.log()

shell.exec("node ./src/res/ci/common/npm/get-n.js")
console.log()

shell.exec("node ./src/res/ci/common/npm/get-npm.js")
console.log()

console.log("NPM Install 🔨")
console.log("--------------")
shell.exec("npm i")
console.log()

shell.exec("node ./src/res/ci/common/npm/outdated.js")
