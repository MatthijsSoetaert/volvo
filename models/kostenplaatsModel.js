var mongoose = require('mongoose');
//Define a schema
var Schema = mongoose.Schema;

var kostenplaats = new Schema({
  naam: {
    type: String
  }
});

module.exports = mongoose.model('kostenplaats',kostenplaats,'kostenplaatsen');