var mongoose = require('mongoose');
//Define a schema
var Schema = mongoose.Schema;

var training = new Schema({
  type: {
    type: String
  },
  aantalDeelnemers:{
    type: Number
  },
  aantalSessies: {
    type: Number
  },
  navigatorNummer: {
    type: String
  },
  eigenaar: {
    type: String
  },
  status: {
    type: String
  },
  budget: {
    type: Number
  },
  offerte: {
    type: Boolean
  },
  bestelbon: {
    type: Boolean
  },
  edb: {
    type: String
  },
  kostenplaats:{
    type: [String]
  },
  factuur: {
    type: Boolean
  },
  subsidie: {
    type: Boolean
  },
  subsidieInstelling: {
    type: String
  },
  subsidieAanvraag: {
    type: String
  },
  subsidieAfhandeling: {
    type: String
  },
  subsidieBedrag: {
    type: Number
  },
  color: {
    type: String
  },
  datum: [Date],
  opmerkingen: {
    type: String
  }
});

module.exports = mongoose.model('training',training,'trainingen');