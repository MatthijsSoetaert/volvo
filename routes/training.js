var express = require('express');
var router = express.Router();
var url = require('url');
var weekModel = require('../models/weekModel')
var trainingModel = require('../models/trainingModel')
var trainerModel = require('../models/trainerModel')
var subsidieInstellingModel = require('../models/subsidieInstelling')
var kostenplaatsModel = require('../models/kostenplaatsModel')

//GET
router.get('/', function (req, res, next) {
  var plaats = url.parse(req.url, true).query.plaats
  var weekid = url.parse(req.url, true).query.weekid

  var selection = false;
  if (plaats != null) {
    selection = true;
  }

  trainingModel.find({}).exec(function (err, list) {
    if (err) { return next(err); }
    var kost = berekenTotaleKost(list)

    res.render('./training/training', { trainingen: list, selection: selection, plaats: plaats, weekid: weekid, kost: kost })
  })
});

//POST
router.post('/', function (req, res, next) {
  var plaats = url.parse(req.url, true).query.plaats;
  var weekid = url.parse(req.url, true).query.weekid;

  var van = JSON.parse(JSON.stringify(req.body.van))
  var tot = JSON.parse(JSON.stringify(req.body.tot))

  if(van.toString() != ""){
    van = getMonday(new Date(van))
  }else{
    van = null
  }

  if(tot.toString() != ""){
    tot = getMonday(new Date(tot));
  }else{
    tot = null
  }

  var selection = false;
  if (plaats != null) {
    selection = true;
  }


  if (van == null & tot == null) {
    trainingModel.find({}).exec(function (err, list) {
      if (err) { return next(err); }
      var kost = berekenTotaleKost(list)
      res.render('./training/training', { trainingen: list, selection: selection, plaats: plaats, weekid: weekid, kost: kost })
    })
  }
  else if (van == null) {
    trainingModel.find({ "datum": { "$elemMatch" :{ "$lt": tot }} }).exec(function (err, list) {
      if (err) { return next(err); }
      var kost = berekenTotaleKost(list)
      res.render('./training/training', { trainingen: list, selection: selection, plaats: plaats, weekid: weekid, kost: kost })
    })
  }
  else if (tot == null) {
    trainingModel.find({ "datum": {"$elemMatch" : { "$gte": van }} }).exec(function (err, list) {
      console.log("thisssss")
      if (err) { return res.end(); }
      var kost = berekenTotaleKost(list)
      return res.render('./training/training', { trainingen: list, selection: selection, plaats: plaats, weekid: weekid, kost: kost })
    })
  }
  else{
    trainingModel.find({ "datum": { "$elemMatch" : { "$gte": van, "$lt": tot }}}).exec(function (err, list) {
      if (err) { return next(err); }
      var kost = berekenTotaleKost(list)
      res.render('./training/training', { trainingen: list, selection: selection, plaats: plaats, weekid: weekid, kost: kost })
    })
  }
});

function berekenTotaleKost(list) {
  var kost = 0
  for (var i = 0; i < list.length; i++) {
    if (list[i].budget != null && list[i].budget != undefined) {
      kost += parseInt(list[i].budget)
    }
  }
  console.log(kost)
  return parseInt(kost)
}

//ADD GET
router.get('/add', function (req, res, next) {
  trainerModel.find().exec(function (err, trainers) {
    if (err) { return next(err); }
    subsidieInstellingModel.find().exec(function (err, subsidieInstellingen) {
      if (err) { return next(err); }
      kostenplaatsModel.find().exec(function (err, kostenplaatsen) {
        if (err) { return next(err); }
        res.render('./training/add', { trainers: trainers, subsidieInstellingen: subsidieInstellingen, kostenplaatsen: kostenplaatsen })
      })
    })
  })
});

//ADD POST
router.post('/add', function (req, res, next) {
  var selectDates = url.parse(req.url, true).query.selectDates;
  addNewTraining(req,res)
  if(selectDates == "true"){
    res.redirect("/calendar/trainingDateSelection")
  }else{
    res.redirect("/training")
  }
});

router.get('/remove', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  console.log(id)
  trainingModel.find({ "_id": id }).deleteOne(function (err, trainers) {
    if (err) { return next(err); }
    res.redirect("/training")
  })
});

router.get('/getNavigatorNumber', function (req, res, next) {
  var type = url.parse(req.url, true).query.type
  trainingModel.find({ "type": type }).exec(function (err, training) {
    if (err) { return next(err); }
    if(training.length != 0){
      res.send(training[0].navigatorNummer)
    }else{
      res.send("")
    }
  })
});

//ADDTODATE GET
router.get('/addToDate', function (req, res, next) {
  var plaats = url.parse(req.url, true).query.plaats
  var trainingid = url.parse(req.url, true).query.trainingid
  var weekid = url.parse(req.url, true).query.weekid

  console.log(weekid)
  weekModel.find({ "_id": weekid }).exec(function (err, week) {
    addTrainingToWeek(trainingid, plaats, week[0], weekid);
    addWeekToTraining(trainingid, plaats, week[0], weekid, res);
  });
});

function addTrainingToWeek(trainingid, plaats, week, weekid) {
  var parts = plaats.split("_")

  var lokaal = parts[2];
  var uur = parts[1] - 1;
  var dag;

  switch (parts[0]) {
    case "ma": dag = 0; break;
    case "di": dag = 1; break;
    case "woe": dag = 2; break;
    case "do": dag = 3; break;
    case "vr": dag = 4; break;
  }

  switch (lokaal) {
    case "TC1": week.lokalen.TC1[dag][uur] = trainingid; break;
    case "TC2": week.lokalen.TC2[dag][uur] = trainingid; break;
    case "TC3": week.lokalen.TC3[dag][uur] = trainingid; break;
    case "TC4": week.lokalen.TC4[dag][uur] = trainingid; break;
    case "TC7": week.lokalen.TC7[dag][uur] = trainingid; break;
    case "TCHAL": week.lokalen.HAL[dag][uur] = trainingid; break;
    case "TCEXTERN": week.lokalen.EXTERN[dag][uur] = trainingid; break;
  }

  console.log(week);
  weekModel.updateOne({ "_id": weekid }, week, function (err, foundWeek) {
    if (err) return console.error(err);
  })
}

function addWeekToTraining(trainingid, plaats, week, weekid, res) {
  trainingModel.find({ "_id": trainingid }).exec(function (err, training) {
    parts = plaats.split("_");
    var day
    switch (parts[0]) {
      case "ma": day = 0; break;
      case "di": day = 1; break;
      case "woe": day = 2; break;
      case "do": day = 3; break;
      case "vr": day = 4; break;
    }
    var dat = new Date(week.datum)
    console.log(day)
    dat.setDate(dat.getDate() + day)
    training[0].datum.push(dat)
    console.log(dat)

    training[0].save(function (err, training) {
      res.redirect("/calendar?weekid=" + weekid)
    })
  })
}

//DETAILS GET
router.get('/detail', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  trainingModel.find({ "_id": id }).exec(function (err, list) {
    if (err) { return next(err); }
    console.log(list[0].datum)
    res.render('./training/details', { training: list[0], trainingen: list[0].datum })
  })
});

//DETAILS GET
router.get('/edit', function (req, res, next) {

  var trainers;
  var subsidieInstellingen;
  var kostenplaatsen
  var id = url.parse(req.url, true).query.id
  trainingModel.find({ "_id": id }).exec(function (err, training) {
    if (err) { return next(err); }
    trainerModel.find().exec(function (err, list) {
      if (err) { return next(err); }
      trainers = list;
      subsidieInstellingModel.find().exec(function (err, list) {
        if (err) { return next(err); }
        subsidieInstellingen = list;
        kostenplaatsModel.find().exec(function (err, list) {
          kostenplaatsen = list
          res.render('./training/edit', { training: training[0], trainers: trainers, subsidieInstellingen: subsidieInstellingen, kostenplaatsen: kostenplaatsen })
        })
      })
    })
  })
});

//EDIT POST
router.post('/edit', function (req, res, next) {
  updateTraining(req);
  redirecturl = "/training/detail?id=" + req.body.id
  res.redirect(redirecturl)
});

function updateTraining(res) {
  var date = new Date();
  var offerte = "";
  var factuur = "";
  var bestelbon = "";
  var subsidie = ""
  if (res.body.offerte == undefined) {
    offerte = false;
  } else {
    offerte = true;
  }

  if (res.body.factuur == undefined) {
    factuur = false;
  } else {
    factuur = true;
  }

  if (res.body.bestelbon == undefined) {
    bestelbon = false;
  } else {
    bestelbon = true;
  }

  if (res.body.subsidie == undefined) {
    subsidie = false;
  } else {
    subsidie = true;
  }
  // console.log(res)
  var training = {
    type: res.body.type,
    aantalDeelnemers: res.body.aantalDeelnemers,
    aantalSessies: res.body.aantalSessies,
    navigatorNummer: res.body.navigatorNr,
    eigenaar: res.body.eigenaar,
    status: res.body.status,
    budget: res.body.budget,
    offerte: offerte,
    bestelbon: bestelbon,
    factuur: factuur,
    edb: res.body.edb,
    kostenplaats: res.body.kostenplaats,
    subsidie: subsidie,
    subsidieInstelling: res.body.subsidieInstelling,
    subsidieAanvraag: res.body.subsidieAanvraag,
    subsidieAfhandeling: res.body.subsidieAfhandeling,
    subsidieBedrag: res.body.subsidieBedrag,
    datum: date,
    color: res.body.color,
    opmerkingen: res.body.opmerkingen
  }

  console.log("color + " + res.body.color)
  trainingModel.updateOne({ "_id": res.body.id }, training, function (err, book) {
    if (err) return console.error(err);
    console.log(training) + " opgeslagen"
  })

  return training
}

function addNewTraining(res) {
  var offerte = "";
  var factuur = "";
  var bestelbon = "";
  var subsidie = ""
  if (res.body.offerte == undefined) {
    offerte = false;
  } else {
    offerte = true;
  }

  if (res.body.factuur == undefined) {
    factuur = false;
  } else {
    factuur = true;
  }

  if (res.body.bestelbon == undefined) {
    bestelbon = false;
  } else {
    bestelbon = true;
  }

  if (res.body.subsidie == undefined) {
    subsidie = false;
  } else {
    subsidie = true;
  }

  // console.log(res)
  var training = new trainingModel({
    type: res.body.type,
    aantalDeelnemers: res.body.aantalDeelnemers,
    aantalSessies: res.body.aantalSessies,
    navigatorNummer: res.body.navigatorNr,
    eigenaar: res.body.eigenaar,
    status: res.body.status,
    budget: res.body.budget,
    offerte: offerte,
    bestelbon: bestelbon,
    factuur: factuur,
    edb: res.body.edb,
    kostenplaats: res.body.kostenplaats,
    subsidie: subsidie,
    subsidieInstelling: res.body.subsidieInstelling,
    subsidieAanvraag: res.body.subsidieAanvraag,
    subsidieAfhandeling: res.body.subsidieAfhandeling,
    subsidieBedrag: res.body.subsidieBedrag,
    color: res.body.color,
    opmerkingen: res.body.opmerkingen
  })

  training.save(function (err, training) {
    if (err) return console.error(err);

    handleFiles(res, training._id)

    trainerModel.find({ "naam": res.body.eigenaar }).exec(function (err, trainer) {
      if (err) { return next(err); }
      trainer[0].trainingen.push(training._id)
      trainer[0].save();
    })
  })
  return training
}

function handleFiles(req, id) {
  if (req.files != null) {
    let factuur = req.files.uploadFactuur
    let bestelbon = req.files.uploadBestelbon
    let offerte = req.files.uploadOfferte

    if (factuur != null) {
      factuur.mv("./public/files/facturen/" + id + "." + factuur.name.split(".")[1], function (err) {
        if (err)
          return res.status(500).send(err);
      });
    }

    if (bestelbon != null) {
      bestelbon.mv("./public/files/bestelbonnen/" + id + "." + bestelbon.name.split(".")[1], function (err) {
        if (err)
          return res.status(500).send(err);
      });
    }

    if (offerte != null) {
      offerte.mv("./public/files/offertes/" + id + "." + offerte.name.split(".")[1], function (err) {
        if (err)
          return res.status(500).send(err);
      });
    }
  }
}

function getMonday(d) {
  d = new Date(d);
  console.log(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

//--------------------------Kostenplaats-----------------------------------

//GET
router.get('/kostenplaatsen', function (req, res, next) {
  kostenplaatsModel.find({}).exec(function (err, list) {
    if (err) { return next(err); }
    res.render('./training/kostenplaats', { kostenplaatsen: list })
  })
});

//ADD SUBSIDIEINSTELLING
router.post('/kostenplaatsen/toevoegen', function (req, res, next) {
  //   if(req.isAuthenticated()){
  var kostenplaats = new kostenplaatsModel({
    naam: req.body.kostenplaats
  })

  kostenplaats.save(function (err, training) {
    console.log(training)
    if (err) return console.error(err);
    res.redirect("/training/kostenplaatsen")
  })
  //  }
  //else{
  //  res.redirect("/login")
  //}
});

//REMOVE SUBSIDIEINSTELLING
router.get('/kostenplaatsen/verwijder', function (req, res, next) {
  //   if(req.isAuthenticated()){
  var id = url.parse(req.url, true).query.id
  kostenplaatsModel.find({ "_id": id }).remove(function (err, list) {
    if (err) { return next(err); }
    res.redirect("/training/kostenplaatsen")

  })

  //  }
  //else{
  //  res.redirect("/login")
  //}
});


module.exports = router;
