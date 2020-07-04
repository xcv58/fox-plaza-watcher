import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import CRONjob from 'meteor/ostrio:cron-jobs'
import { Mongo } from 'meteor/mongo'
import moment from 'moment';
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

const extractUnits = (data) => {
  if (!data) {
    return []
  }
  const { result } = JSON.parse(data)
  if (!result) {
    return []
  }
  const { available_units_count, pricing, start_date, end_date } = result
  const { unit_distribution } = pricing
  const units = unit_distribution.map(distribution => {
    return { ...distribution, available_units_count, start_date, end_date }
  })
  return units
}

const getTargetDates = () => {
  const today = moment()
  return [
    today.format('YYYY-MM-DD'),
    today.add(14, 'days').format('YYYY-MM-DD'),
    today.add(14, 'days').format('YYYY-MM-DD'),
    today.add(14, 'days').format('YYYY-MM-DD')
  ]
}

const ENDPOINT_PREFIX = 'https://www.essexapartmenthomes.com/EPT_Feature/PropertyManagement/Service/GetPropertyFilters/518105/'

const logData = (targetDate) => {
  try {
    const result = HTTP.call(
      'GET',
      `${ENDPOINT_PREFIX}${targetDate}`
    )

    console.log(
      `${ENDPOINT_PREFIX}${targetDate}`
    );
    console.log(`Get data for ${targetDate}`)
    const { data } = result
    // console.log(data.result.pricing);
    // console.log(data.);
    const queryAt = new Date()
    // const array = extractData(data)
    const units = extractUnits(data)
    console.log({ units });
    units.forEach(x => {
      // const { name, rent_range, targetDate, rent } = x
      // TODO: remove duplication
      console.log(x);
      Prices.insert({ queryAt, targetDate, ...x })
    })
  } catch (e) {
    console.error(e)
  }
}

const executeTask = (ready) => bound(
  () => {
    getTargetDates().forEach(targetDate => logData(targetDate))
    ready()
  }
)

const HOUR = 60 * 60 * 1000

Meteor.startup(() => {
  // code to run on server at startup
  // executeTask(() => {})
  cron.setInterval(executeTask, 8 * HOUR, 'execute-every-8-hours');
});
