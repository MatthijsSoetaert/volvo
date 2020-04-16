var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
var weekModel = require('../models/weekModel')
var trainingModel = require('../models/trainingModel')
var url = require('url');

/* GET home page. */
router.get('/', function (req, res, next) {
  var weekid = url.parse(req.url, true).query.weekid

  if (weekid != null) {
    weekModel.find({ "_id": weekid }).exec(function (err, list) {
      transformToTrainingList(list[0], res);
    });
  }

  else {
    var today = new Date();
    today = getMonday(today)
    today.setDate(today.getDate()-1);    
    var tomorrow = getMonday(new Date())
    weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
      console.log(tomorrow)
      let temp;
      if (list[0] == null) {
        temp = addNewDateToDatabase(today,res);
      }
      else{
        temp = list[0]
      }
      transformToTrainingList(temp, res);
    });
  }
});

router.post('/', function (req, res, next) {
  parts = req.body.date.split("/")

  var today = new Date(parts[2], parts[0] - 1, parts[1]);
  today = getMonday(today)
  var tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  console.log(today)
  console.log(tomorrow)
  weekModel.find({ "datum": { "$gte": today, "$lt": tomorrow } }).exec(function (err, list) {
    var id
    if (list[0] == null) {
      list[0] = addNewDateToDatabase(today,res);
    }else{
      id = list[0]._id;
      res.redirect("/calendar?weekid="+id )
    }
  });
});


router.get('/removeOnDate',function(req,res,next){
  var weekid = url.parse(req.url, true).query.weekid
  var trainingId = url.parse(req.url, true).query.trainingid
  var plaats = url.parse(req.url, true).query.plaats

  console.log(trainingId)
  weekModel.find({ "_id": weekid}).exec(function (err, week) {
    trainingModel.find({ "_id": trainingId}).exec(function (err, training) {
      removeTrainingFromDate(week[0],training[0],plaats,res)
    })
  })
});

function removeTrainingFromDate(week,training,plaats,res){
  var parts = plaats.split("_");
  var lokaal = parts[2]
  var uur = parseInt(parts[1] - 1)
  var dag = getDayNumber(parts[0])
  console.log(week.lokalen.TC2)

  switch(lokaal){
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

  for(var i = 0; i < training.datum.length; i++){
    console.log(new Date(training.datum[i]).getDate())
    console.log(new Date(training.datum[i]).getMonth())
    console.log(new Date(training.datum[i]).getFullYear())
  
    console.log(dat.getDate())
    console.log(dat.getMonth())
    console.log(dat.getFullYear())
  
    if(new Date(training.datum[i]).getDate() == dat.getDate() && new Date(training.datum[i]).getMonth() == dat.getMonth() && new Date(training.datum[i]).getYear() == dat.getYear()){
      training.datum.splice(i,1)
      console.log(training.datum)
    }
  }
  trainingModel.updateOne({"_id": training._id},training,function (err, training) {
    if (err) return console.error(err);
    weekModel.updateOne({"_id": week._id},week,function (err, week2) {
      if (err) return console.error(err);
      res.redirect("/calendar?weekid="+week._id)
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

function getDayNumber(item){
  switch(item){
    case "ma": return 0;
    case "di": return 1;
    case "woe": return 2;
    case "do": return 3;
    case "vr": return 4;
  }
}

function transformToTrainingList(week, res) {
  var trainingen = [];
  var item;
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

        let vals = map[training];
        if (vals == undefined) {
          map[training] = []
          vals = [];

        }
        vals.push(locString)
        map[training] = vals;
      }

      if (week.lokalen.TC2[i][j] != "") {
        training = week.lokalen.TC2[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC2";
        trainingen.push(training)
        let vals = map[training];
        if (vals == undefined) {
          map[training] = []
          vals = [];

        }
        vals.push(locString)
        map[training] = vals;
      }

      if (week.lokalen.TC3[i][j] != "") {
        training = week.lokalen.TC3[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC3";
        trainingen.push(training)
        let vals = map[training];
        if (vals == undefined) {
          map[training] = []
          vals = [];

        }
        vals.push(locString)
        map[training] = vals;
      }

      if (week.lokalen.TC4[i][j] != "") {
        training = week.lokalen.TC4[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC4";
        trainingen.push(training)
        let vals = map[training];
        if (vals == undefined) {
          map[training] = []
          vals = [];
        }
        vals.push(locString)
        map[training] = vals;
      }

      if (week.lokalen.TC7[i][j] != "") {
        training = week.lokalen.TC7[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TC7";
        trainingen.push(training)
        let vals = map[training];
        if (vals == undefined) {
          map[training] = []
          vals = [];

        }
        vals.push(locString)
        map[training] = vals;
      }

      if (week.lokalen.HAL[i][j] != "") {
        training = week.lokalen.HAL[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TCHAL";
        trainingen.push(training)
        let vals = map[training];
        if (vals == undefined) {
          map[training] = []
          vals = [];

        }
        vals.push(locString)
        map[training] = vals;
      }

      if (week.lokalen.EXTERN[i][j] != "") {
        training = week.lokalen.EXTERN[i][j]
        locString = getDay(i) + "_" + (j + 1) + "_TCEXTERN";
        trainingen.push(training)
        let vals = map[training];
        if (vals == undefined) {
          map[training] = []
          vals = [];

        }
        vals.push(locString)
        map[training] = vals;
      }
    }
  }

  var ids = [];
  var result = [];
  for (var q = 0; q < trainingen.length; q++) {
    ids.push(mongoose.Types.ObjectId(trainingen[q]))
  }

  trainingModel.find({
    '_id': {
      $in: ids
    }
  }).exec(function (err, list) {
    for (var i = 0; i < list.length; i++) {
      result[i] = {
        type: list[i].type,
        aantalDeelnemers: list[i].aantalDeelnemers,
        aantalSessies: list[i].aantalSessies,
        eigenaar: list[i].eigenaar,
        navigatorNummer: list[i].navigatorNummer,
        id: list[i]._id,
        locs: map[list[i]._id],
        color: list[i].color,
        opmerkingen: list[i].opmerkingen
      };
    }

    res.render("./calendar/calendar", {
      trainingen: JSON.stringify(result),
      id: week._id
    })
  });
}

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

function addNewDateToDatabase(today,res) {
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
      res.redirect("/calendar?weekid="+id )
    //});
  })

  return dag
}

module.exports = router;