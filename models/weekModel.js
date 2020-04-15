var mongoose = require('mongoose');
//Define a schema
var Schema = mongoose.Schema;

var week = new Schema({
  datum: {
    type: Date
  },
  lokalen: {
    TC1: [[String]],
    TC2: [[String]],
    TC3: [[String]],
    TC4: [[String]],
    TC7: [[String]],
    HAL: [[String]],
    EXTERN: [[String]]
    }
});

module.exports = mongoose.model('dagen',week,'dagen');