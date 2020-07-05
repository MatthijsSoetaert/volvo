var express = require('express');
var router = express.Router();
var url = require('url');
var fileUpload = require('express-fileupload')
var weekModel = require('../models/weekModel')
var trainingModel = require('../models/trainingModel')
var trainerModel = require('../models/trainerModel')
var subsidieInstellingModel = require('../models/subsidieInstelling')
var kostenplaatsModel = require('../models/kostenplaatsModel')

router.get('/', function (req, res, next) {
  //   if(req.isAuthenticated()){

  trainerModel.find().exec(function (err, list) {
    if (err) { return next(err); }
    res.render('./training/trainers', { trainers: list })
  })
  //  }
  //else{
  //  res.redirect("/login")
  //}
});

router.post('/add', function (req, res, next) {
  //   if(req.isAuthenticated()){
  addNewTrainer(req);
  res.redirect("/trainers")
  //  }
  //else{
  //  res.redirect("/login")
  //}
});

router.get('/remove', function (req, res, next) {
  //   if(req.isAuthenticated()){
  var id = url.parse(req.url, true).query.id
  trainerModel.find({ "_id": id }).deleteOne(function (err, list) {
    if (err) { return next(err); }
    res.redirect("/training/trainers")
  })

  //  }
  //else{
  //  res.redirect("/login")
  //}
});

router.get('/details', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  var date = getMonday(new Date())

  trainerModel.find({ "_id": id }).exec(function (err, trainer) {
    if (err) { return next(err); }

    trainer = trainer[0]
    trainingModel.find({ '_id': { $in: trainer.trainingen } }).exec(function (err, trainingen) {
      if (err) { return next(err); }
      subsidieInstellingModel.find().exec(function (err, subsidieInstellingen) {
        if (err) { return next(err); }
        var trainingListWithCorrectDate = []

        for (var i = 0; i < trainingen.length; i++) {
          var trainingDate = new Date(trainingen[i].datum);
          if (trainingDate.getDay() == date.getDay() && trainingDate.getMonth() == date.getMonth() && trainingDate.getFullYear() == date.getFullYear()) {
            trainingListWithCorrectDate.push(trainingen[i])
          }
        }
        res.render("./training/trainerDetails", { trainer: trainer, trainingen: trainingListWithCorrectDate, subsidieInstellingen: subsidieInstellingen })
      })
    });
  })
});

router.post('/details', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  var date = getMonday(new Date(req.body.trainer))

  trainerModel.find({ "_id": id }).exec(function (err, trainer) {
    if (err) { return next(err); }
    trainer = trainer[0]
    trainingModel.find({ '_id': { $in: trainer.trainingen } }).exec(function (err, trainingen) {
      var trainingListWithCorrectDate = []
      console.log("tes")
      for (var i = 0; i < trainingen.length; i++) {
        var trainingDate = new Date(trainingen[i].datum);
        if (trainingDate.getDate() == date.getDate() && trainingDate.getMonth() == date.getMonth() && trainingDate.getFullYear() == date.getFullYear()) {
          trainingListWithCorrectDate.push(trainingen[i])
        }
      }
      res.render("./training/trainerDetails", { trainer: trainer, trainingen: trainingListWithCorrectDate })
    });
  })
});

router.post('/edit', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  trainerModel.find({ "_id": id }).exec(function (err, trainer) {
    console.log(req.body.kleur)
    if (err) { return next(err); }
    trainer[0].kleur = req.body.kleur
    trainer[0].save(function(){
      res.redirect("/trainers")
    })
  })
});

function addNewTrainer(res) {

  var trainer = new trainerModel({
    naam: res.body.naam,
    kleur: res.body.kleur
  })

  trainer.save(function (err, trainer) {
    if (err) return console.error(err);
    console.log(trainer) + " opgeslagen"
  })
  return trainer
}

function getMonday(d) {
  d = new Date(d);
  console.log(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}
//--------------------------SUBSIDIES-----------------------------------

module.exports = router;
