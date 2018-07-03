import { Meteor } from 'meteor/meteor';
import Prices from './collections/Prices'
import Tabular from 'meteor/aldeed:tabular';
import moment from 'moment';

new Tabular.Table({
  name: "Prices",
  collection: Prices,
  columns: [
    {data: "unit_code", title: "Unit"},
    {data: "rent", title: "Price"},
    {data: "rent_range", title: "Range"},
    {data: "targetDate", title: "Move in Date"},
    {data: "make_ready_date", title: "Ready Date"},
    {
      data: "queryAt",
      title: "Last Check Time",
      render: function (val, type, doc) {
        if (val instanceof Date) {
          return moment(val).calendar();
        } else {
          return "Never";
        }
      }
    },
    {data: "name", title: "Type"},
    // {
    //   tmpl: Meteor.isClient && Template.bookCheckOutCell
    // }
  ]
});
