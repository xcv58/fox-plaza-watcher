import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import dataTablesBootstrap from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import Tabular from 'meteor/aldeed:tabular';
import moment from 'moment';
import './main.html';
import '../imports/TabularTable'

dataTablesBootstrap(window, $);
