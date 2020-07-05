var mongoose = require('mongoose');
//Define a schema
var Schema = mongoose.Schema;

var trainer = new Schema({
  naam: {
    type: String
  },
  kleur:{
    type: String
  },
  trainingen: {
    type: [String]
  }
});

module.exports = mongoose.model('trainer',trainer,'trainers');