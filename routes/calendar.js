var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
var weekModel = require('../models/weekModel')
var trainingModel = require('../models/trainingModel')
var trainerModel = require("../models/trainerModel")
var url = require('url');

/* GET home page. */
router.get('/', function (req, res, next) {
  var weekid = url.parse(req.url, true).query.weekid

  if (weekid != null) {
    weekModel.find({ "_id": weekid }).exec(function (err, list) {
      transformToTrainingList(list[0], res, false, false);
    });
  }
  else {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    today = getMonday(today)
    today.setDate(today.getDate() - 1);
    var tomorrow = getMonday(new Date())
    weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
      let temp;
      if (list[0] == null) {
        temp = addNewDateToDatabase(today, res);
      }
      else {
        temp = list[0]
      }
      transformToTrainingList(temp, res, false, false);
    });
  }
});

router.post('/', function (req, res, next) {
  parts = req.body.date.split("/")

  var today = new Date(parts[2], parts[0] - 1, parts[1]);
  today = getMonday(today)
  var tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
    var id
    if (list[0] == null) {
      list[0] = addNewDateToDatabase(today, res);
    } else {
      id = list[0]._id;
      res.redirect("/calendar?weekid=" + id)
    }
  });
});

router.get('/trainingenData', function (req, res, next) {
  var weekid = url.parse(req.url, true).query.weekid

  if (weekid != null) {
    weekModel.find({ "_id": weekid }).exec(function (err, list) {
      transformToTrainingList(list[0], res, true, false);
    });
  }
  else {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    today = getMonday(today)
    today.setDate(today.getDate() - 1);
    var tomorrow = getMonday(new Date())
    weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
      let temp;
      if (list[0] == null) {
        temp = addNewDateToDatabase(today, res);
      }
      else {
        temp = list[0]
      }
      transformToTrainingList(temp, res, true, false);
    });
  }
});

router.post('/trainingenData', function (req, res, next) {
  parts = req.body.date.split("/")
  var today = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
  today = getMonday(today)
  today.setDate(today.getDate() - 1)
  var tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  console.log("1: today " + today + " and tomorrow " + tomorrow)
  if (parts.length != 1) {
    weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
      if (list != null && list[0] != null) {
        transformToTrainingList(list[0], res, true, false);
      } else {
        let temp;
        console.log("tot hier")
        var dag = new weekModel({
          datum: today,
          lokalen: {
            TC1: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
            TC2: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
            TC3: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
            TC4: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
            TC7: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
            HAL: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
            EXTERN: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
          }
        })

        dag.save(function (err, week) {
          transformToTrainingList(week, res, true, false);
        })
      }
    });
  } else {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    today = getMonday(today)
    today.setDate(today.getDate() - 1);
    var tomorrow = getMonday(new Date())
    console.log("2: today " + today + " and tomorrow " + tomorrow)

    weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
      transformToTrainingList(list[0], res, true, false);
    })
  }
});

router.get('/trainingDateSelection', function (req, res, next) {

  var weekid = url.parse(req.url, true).query.weekid

  if (weekid != null) {
    weekModel.find({ "_id": weekid }).exec(function (err, list) {
      transformToTrainingList(list[0], res, false, true);
    });
  }

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  today = getMonday(today)
  today.setDate(today.getDate() - 1);
  var tomorrow = getMonday(new Date())
  weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
    let temp;
    if (list[0] == null) {
      temp = addNewDateToDatabase(today, res, true);
    }
    else {
      temp = list[0]
    }
    transformToTrainingList(temp, res, false, true);
  });
});

//GET WEEK NUMBER
Date.prototype.getWeek = function () {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

router.get('/removeOnDate', function (req, res, next) {
  var weekid = url.parse(req.url, true).query.weekid
  var trainingId = url.parse(req.url, true).query.trainingid
  var plaats = url.parse(req.url, true).query.plaats

  weekModel.find({ "_id": weekid }).exec(function (err, week) {
    trainingModel.find({ "_id": trainingId }).exec(function (err, training) {
      removeTrainingFromDate(week[0], training[0], plaats, res)
    })
  })
});

function removeTrainingFromDate(week, training, plaats, res) {
  var parts = plaats.split("_");
  var lokaal = parts[2]
  var uur = parseInt(parts[1] - 1)
  var dag = getDayNumber(parts[0])

  switch (lokaal) {
    case "TC1": {
      week.lokalen.TC1[dag][uur] = ""
      break;
    }
    case "TC2": {
      week.lokalen.TC2[dag][uur] = ""
      break;
    }
    case "TC3": {
      week.lokalen.TC3[dag][uur] = ""
      break;
    }
    case "TC4": {
      week.lokalen.TC4[dag][uur] = ""
      break;
    }
    case "TC7": {
      week.lokalen.TC7[dag][uur] = ""
      break;
    }
    case "HAL": {
      week.lokalen.HAL[dag][uur] = ""
      break;
    }
    case "EXTERN": {
      week.lokalen.EXTERN[dag][uur] = ""
      break;
    }
  }

  var dat = new Date(week.datum)
  dat.setDate(dat.getDate() + dag)

  for (var i = 0; i < training.datum.length; i++) {

    if (new Date(training.datum[i]).getDate() == dat.getDate() && new Date(training.datum[i]).getMonth() == dat.getMonth() && new Date(training.datum[i]).getYear() == dat.getYear()) {
      training.datum.splice(i, 1)
    }
  }
  trainingModel.updateOne({ "_id": training._id }, training, function (err, training) {
    if (err) return console.error(err);
    weekModel.updateOne({ "_id": week._id }, week, function (err, week2) {
      if (err) return console.error(err);
      res.redirect("/calendar?weekid=" + week._id)
    })
  })
}

function getDay(i) {
  switch (i) {
    case 0: return "ma";
    case 1: return "di";
    case 2: return "woe";
    case 3: return "do";
    case 4: return "vr";
  }
}

function getDayNumber(item) {
  switch (item) {
    case "ma": return 0;
    case "di": return 1;
    case "woe": return 2;
    case "do": return 3;
    case "vr": return 4;
  }
}

function addToMaps(map, training, locString) {
  let vals = map[training];
  if (vals == undefined) {
    map[training] = []
    vals = [];
  }
  vals.push(locString)
  map[training] = vals;
}

function transformToTrainingList(week, res, onlyData, dateSelection) {
  var returnv = getTrainingAndMap(week, res)

  var trainingen = returnv[0]
  var map = returnv[1]

  console.log(trainingen, map)
  var ids = [];
  var result = [];

  //Voeg ids toe aan lijst
  for (var q = 0; q < trainingen.length; q++) {
    ids.push(mongoose.Types.ObjectId(trainingen[q]))
  }

  //vind alle trainingen in id lijst
  trainingModel.find({ '_id': { $in: ids } }).exec(function (err, trainingen) {
    var trainerids = []
    for (var i = 0; i < trainingen.length; i++) {
      if (!trainerids.includes(trainingen[i].eigenaar)) {
        trainerids.push(trainingen[i].eigenaar)
      }
    }

    //vind alle trainers die voorkomen in trainingen
    trainerModel.find({ 'naam': { $in: trainerids } }).exec(function (err, trainers) {
      for (var i = 0; i < trainingen.length; i++) {
        var color = ""
        for (var j = 0; j < trainers.length; j++) {
          if (trainers[j].naam == trainingen[i].eigenaar) {
            color = trainers[j].kleur
            break;
          }
        }

        result[i] = {
          type: trainingen[i].type,
          aantalDeelnemers: trainingen[i].aantalDeelnemers,
          aantalSessies: trainingen[i].aantalSessies,
          eigenaar: trainingen[i].eigenaar,
          navigatorNummer: trainingen[i].navigatorNummer,
          id: trainingen[i]._id,
          locs: map[trainingen[i]._id],
          color: color,
          opmerkingen: trainingen[i].opmerkingen
        };
      }
      var weeknummer = week.datum.getWeek();

      if (onlyData) {
        res.send({
          trainingen: JSON.stringify(result),
          id: week._id,
          weeknumber: weeknummer,
          weekdatum: week.datum
        })
      } else if (!dateSelection) {
        res.render("./calendar/calendar", {
          trainingen: JSON.stringify(result),
          id: week._id,
          weeknumber: weeknummer,
          weekdatum: week.datum
        })
      }
      else {
        res.render("./calendar/dateSelectionCalendar", {
          trainingen: JSON.stringify(result),
          id: week._id,
          weeknumber: weeknummer,
          weekdatum: week.datum
        })
      }
    })
  });
}

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

function getTrainingAndMap(week) {

  var trainingen = [];
  var map = {}

  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 4; j++) {
      let temp;
      let training;
      let locString

      if (week.lokalen.TC1[i][j] != "") {
        training = week.lokalen.TC1[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC1";
        trainingen.push(training)
        addToMaps(map, training, locString);
      }

      if (week.lokalen.TC2[i][j] != "") {
        training = week.lokalen.TC2[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC2";
        trainingen.push(training)
        addToMaps(map, training, locString);

      }

      if (week.lokalen.TC3[i][j] != "") {
        training = week.lokalen.TC3[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC3";
        trainingen.push(training)
        addToMaps(map, training, locString);
      }

      if (week.lokalen.TC4[i][j] != "") {
        training = week.lokalen.TC4[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC4";
        addToMaps(map, training, locString);
      }

      if (week.lokalen.TC7[i][j] != "") {
        training = week.lokalen.TC7[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC7";
        addToMaps(map, training, locString);
      }

      if (week.lokalen.HAL[i][j] != "") {
        training = week.lokalen.HAL[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TCHAL";
        addToMaps(map, training, locString);
      }

      if (week.lokalen.EXTERN[i][j] != "") {
        training = week.lokalen.EXTERN[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TCEXTERN";
        addToMaps(map, training, locString);
      }
    }
  }

  return [trainingen, map]
}

function addNewDateToDatabase(today, res, trainingDateSelect) {
  var dag = new weekModel({
    datum: today,
    lokalen: {
      TC1: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
      TC2: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
      TC3: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
      TC4: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
      TC7: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
      HAL: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
      EXTERN: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]],
    }
  })

  dag.save(function (err, week) {
    if (err) return console.error(err);
    //weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
    id = week._id
    if (!trainingDateSelect) {
      res.redirect("/calendar?weekid=" + id)
    } else {
      res.redirect("/calendar/trainingDateSelection?weekid=" + id)
    }
    //});
  })

  return dag
}

module.exports = router;