const { time, TimestampStyles } = require('discord.js')

module.exports = (timestamp) => {
  let platoError = (timestamp + "").length - 10
  // console.log(
  //   {
  //     timestamp: timestamp,
  //     platoError: platoError
  //   }
  // )
  if (platoError > 0) {
    timestamp = Math.floor(timestamp / Math.pow(10, platoError))
  }
  // console.log(
  //   {
  //     timestamp: timestamp
  //   }
  // )
  return time(timestamp, TimestampStyles.LongDate) + " " +
    time(timestamp, TimestampStyles.LongTime) + " " +
    `\`(${timestamp})\``
}
