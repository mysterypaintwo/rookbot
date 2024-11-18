import shell from 'shelljs'

console.log("UPDATE 🔨")
console.log("=========")

shell.exec("node ./src/res/ci/common/ver.js")
console.log()

shell.exec("node ./src/res/ci/common/npm/outdated.js")
console.log()

console.log("NPM Update 🔨")
console.log("-------------")
shell.exec("npm up")
console.log()

shell.exec("node ./src/res/ci/common/npm/outdated.js")
