import shell from 'shelljs'

console.log("NPM Outdated")
console.log("------------")
let outdated = shell.exec("npm outdated")
if (outdated.stdout.trim() == "" && outdated.stderr.trim() == "") {
  console.log("🟩  Up to Date")
}
