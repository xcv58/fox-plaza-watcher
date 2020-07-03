import { Meteor } from 'meteor/meteor';
import Prices from './collections/Prices'
import Tabular from 'meteor/aldeed:tabular';
import moment from 'moment';

const MONEY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

const moneyCell = (val) => MONEY_FORMATTER.format(val)

const timeCell = (val, type, doc) => {
  return moment(val).calendar();
}

new Tabular.Table({
  name: "Prices",
  collection: Prices,
  responsive: true,
  autoWidth: false,
  lengthMenu: [[25, 50, 100, -1], [25, 50, 100, "All"]],
  columns: [
    { data: "minimum_rent", title: "Min Rent", render: moneyCell },
    { data: "maximum_rent", title: "Max Rent", render: moneyCell },
    { data: "queryAt", title: "Last Check Time", render: timeCell },
    { data: "start_date", title: "Start Date", render: timeCell },
    { data: "end_date", title: "End Date", render: timeCell },
    // {
    //   tmpl: Meteor.isClient && Template.bookCheckOutCell
    // }
  ]
});
