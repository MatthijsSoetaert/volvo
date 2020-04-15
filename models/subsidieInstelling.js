var mongoose = require('mongoose');
//Define a schema
var Schema = mongoose.Schema;

var subsidieInstelling = new Schema({
  naam: {
    type: String
  }
});

module.exports = mongoose.model('subsidieInstelling',subsidieInstelling,'subsidieInstellingen');