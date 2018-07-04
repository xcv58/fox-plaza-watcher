import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import { CRONjob } from 'meteor/ostrio:cron-jobs'
import { Mongo } from 'meteor/mongo'
import Prices from '../imports/collections/Prices'
import '../imports/TabularTable'

const db = new Mongo.Collection('cron').rawDatabase()
const cron = new CRONjob({ db })

const bound = Meteor.bindEnvironment((callback) => {
  callback()
})

const extractData = (data) => {
  return data.map(x => {
    const { bed_bath, beds, baths, floorplans } = x
    if (floorplans && floorplans.length) {
      const { units, sqft_range, rent_range, property_code, sqft_display, name } = floorplans[0]
      return units.map(unit => ({
        sqft_range,
        rent_range,
        property_code,
        sqft_display,
        name,
        ...unit
      }))
    }
    return []
  }).reduce((acc, cur) => acc.concat(cur), [])
}

const TARGET_DATES = [
  '08-15-2018',
  '09-01-2018',
  '09-15-2018',
  '09-30-2018',
]

const logData = (targetDate) => {
  try {
    const result = HTTP.call(
      'GET',
      `https://www.essexapartmenthomes.com/api/get-available/247/${targetDate}`
    )
    console.log(`Get data for ${targetDate}`)
    const { data } = result
    const queryAt = new Date()
    const array = extractData(data)
    array.forEach(x => {
      // const { name, rent_range, targetDate, rent } = x
      // TODO: remove duplication
      Prices.insert({ queryAt, targetDate, ...x })
    })
  } catch (e) {
    console.error(e)
  }
}

const executeTask = (ready) => bound(
  () => {
    TARGET_DATES.forEach(targetDate => logData(targetDate))
    ready()
  }
)

const HOUR = 60 * 60 * 1000

Meteor.startup(() => {
  // code to run on server at startup
  // executeTask()
  cron.setInterval(executeTask, 8 * HOUR, 'execute-1-hour');
});
