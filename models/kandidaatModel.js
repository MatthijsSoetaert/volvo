var mongoose = require('mongoose');
//Define a schema
var Schema = mongoose.Schema;

var kandidaat = new Schema({
  datum: {
    type : Date
  },
  voornaam: {
    type : String
  },
  familienaam:{
    type : String
  },
  werkplekleren:{
    type : Boolean
  },
  rehire: {
    type : Boolean
  },
  reguliere: {
    type : Boolean
  },
  testing: {
    type : String
  },
  testingscore: {
    type : Number
  },
  veiligheid: {
    type : Boolean
  },
  veiligheidscore: {
    type : Number
  },
  cc: {
    type : Boolean
  },
  ccscore: {
    type : Number
  },
  takel: {
    type : Boolean
  }, 
  takelscore: {
    type : Number
  },
  gecertificeerd: {
    type : Boolean
  },
  feedback1:{
    type : String
  },
  feedback2:{
    type : String
  },
  feedback3:{
    type : String
  },
  feedback4:{
    type : String
  },
  feedback5:{
    type : String
  },
  eindbesluit: {
    type : String
  },
  imgext: {
    type: String
  }
});

module.exports = mongoose.model('kandidaat',kandidaat,'kandidaten');