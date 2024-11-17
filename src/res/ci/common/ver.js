import AsciiTable from 'ascii-table'
import semver from 'semver'
import shell from 'shelljs'
import fs from 'fs'

let PACKAGE = JSON.parse(fs.readFileSync("./package.json", "utf8"))

let data = {}
for(let module of [ "node", "npm", "discord.js" ]) {
  data[module] = {}
  data[module].current = ""
  let current = ""
  if ([ "node", "npm" ].includes(module)) {
    current = shell.exec(
      `${module} -v`,
      { silent: true }
    )
    current = current.stdout.trim()
    if (current.startsWith("v")) {
      current = current.substring(1)
    }
    data[module].current = current
  } else {
    let listing = shell.exec(
      `npm list ${module} --depth=0`,
      { silent: true }
    )
    current = listing.stdout.trim()
    let matches = current.match(`${module}@(.*)`)
    if (matches) {
      current = matches[1]
    }
    if (current.startsWith("v")) {
      current = current.substring(1)
    }
    data[module].current = current
  }
  data[module].latest = shell.exec(
    `npm v ${module} version`,
    { silent: true }
  ).stdout.trim()
}
data[ PACKAGE.name ] = { current: `${PACKAGE.version}` }

let Table = new AsciiTable(`♖ ${PACKAGE.name} ♖`, {})
  .setHeading(
    "App",
    "Current",
    "Latest"
  )
for(let [module, mData] of Object.entries(data)) {
  let mName = module
  if (mName == "npm") {
    mName = mName.toUpperCase()
  } else {
    mName = mName.charAt(0).toUpperCase() + mName.slice(1)
  }
  let cur = data[module].current
  let lat = data[module].latest

  if (cur && cur.charAt(0).toLowerCase() !== 'v') {
    cur = `v${cur}`
  }
  if (lat && lat.charAt(0).toLowerCase() !== 'v') {
    lat = `v${lat}`
  }

  Table.addRow(
    mName,
    cur,
    lat
  )
}
console.log(Table.toString())

Table = new AsciiTable("Functionality", {})
let djs = data["discord.js"]
for (let func of ["Pagination","Collectors"]) {
  let validVer = false;
  if (djs && djs.current) {
    validVer = semver.lt(djs.current, "13.0.0")
  }
  Table.addRow(
    func,
    validVer ? "🟩" : "🟥"
  )
}
console.log(Table.toString())
