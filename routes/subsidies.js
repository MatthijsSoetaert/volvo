var express = require('express');
var router = express.Router();
var url = require('url');
var fileUpload = require('express-fileupload')
//--------------------------SUBSIDIES-----------------------------------
//GET
router.get('/subsidies', function (req, res, next) {
    trainingModel.find({ "subsidie": true }).exec(function (err, list) {
      if (err) { return next(err); }
      res.render('./training/subsidies', { trainingen: list })
    })
  });
  
  //POST
  router.post('/subsidies', function (req, res, next) {
    var van = getMonday(new Date(req.body.van));
    var tot = getMonday(new Date(req.body.tot));
  
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
  
    if (van == null & tot == null) {
      trainingModel.find({ "subsidie": true }).exec(function (err, list) {
        if (err) { return next(err); }
        res.render('./training/subsidies', { trainingen: list, selection: false })
      })
    }
    else if (van == null) {
      trainingModel.find({ "datum": { "$lt": tot }, "subsidie": true }).exec(function (err, list) {
        if (err) { return next(err); }
        res.render('./training/subsidies', { trainingen: list, selection: false })
      })
    }
    else if (tot == null) {
      trainingModel.find({ "datum": { "$gte": van }, "subsidie": true }).exec(function (err, list) {
        if (err) { return next(err); }
        res.render('./training/subsidies', { trainingen: list, selection: false })
      })
    }else{
  
      trainingModel.find({ "datum": { "$gte": van, "$lt": tot }, "subsidie": true }).exec(function (err, list) {
        if (err) { return next(err); }
        var kost = berekenTotaleKost(list)
        res.render('./training/subsidies', { trainingen: list, selection: false })
      })
    }
  
  });
  
  //GET
  router.get('/subsidies/subsidieInstellingen', function (req, res, next) {
    subsidieInstellingModel.find({}).exec(function (err, list) {
      if (err) { return next(err); }
      res.render('./training/subsidieInstelling', { instellingen: list })
    })
  });
  
  //ADD SUBSIDIEINSTELLING
  router.post('/subsidies/instelling/toevoegen', function (req, res, next) {
    //   if(req.isAuthenticated()){
    console.log(req.body.instelling)
    var subsidieInstelling = new subsidieInstellingModel({
      naam: req.body.instelling
    })
  
    subsidieInstelling.save(function (err, training) {
      console.log(training)
      if (err) return console.error(err);
      res.redirect("/training/subsidies/subsidieInstellingen")
    })
    //  }
    //else{
    //  res.redirect("/login")
    //}
  });
  
  //REMOVE SUBSIDIEINSTELLING
  router.get('/subsidies/instelling/verwijderen', function (req, res, next) {
    //   if(req.isAuthenticated()){
    var id = url.parse(req.url, true).query.id
    subsidieInstellingModel.find({ "_id": id }).remove(function (err, list) {
      if (err) { return next(err); }
      res.redirect("/training/subsidies/subsidieInstellingen")
  
    })
  
    //  }
    //else{
    //  res.redirect("/login")
    //}
  });
module.exports = router;
