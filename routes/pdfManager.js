var express = require('express');
var router = express.Router();
var PDFDocument = require('pdfkit');
var url = require('url');
var PdfTable = require('voilab-pdf-table');

var kandidaatModel = require('../models/kandidaatModel')
var trainingModel = require('../models/trainingModel')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/downloadVerslagKandidaat', function (req, res, next) {
  var id = url.parse(req.url, true).query.id

  kandidaatModel.findOne({ "_id": id }).exec(function (err, item) {
    if (err) { return next(err); }

    const doc = new PDFDocument;
    doc.pipe(res);

    var link = "./public/images/profilePictures/" + item.id + "."

    console.log(link)

    doc.image(link + "jpg", { width: 200 })
    doc.fontSize(25).text(item.voornaam + " " + item.familienaam, 350, 150)

    if (item.werkplekleren) {
      doc.image("./public/images/Checkboxes/check-box.jpg", 70, 350, { scale: 0.02 })
    }
    else {
      doc.image("./public/images/Checkboxes/blank-check-box.jpg", 70, 350, { scale: 0.02 })
    }
    doc.fontSize(12).text("Werkplekleren", 85, 351)

    if (item.rehire) {
      doc.image("./public/images/Checkboxes/check-box.jpg", 200, 350, { scale: 0.02 })
    }
    else {
      doc.image("./public/images/Checkboxes/blank-check-box.jpg", 200, 350, { scale: 0.02 })
    }
    doc.fontSize(12).text("Rehire", 215, 351)

    if (item.reguliere) {
      doc.image("./public/images/Checkboxes/check-box.jpg", 300, 350, { scale: 0.02 })
    }
    else {
      doc.image("./public/images/Checkboxes/blank-check-box.jpg", 300, 350, { scale: 0.02 })
    }
    doc.fontSize(12).text("Reguliere", 315, 351)

    if (item.gecertificeerd) {
      doc.image("./public/images/Checkboxes/check-box.jpg", 400, 350, { scale: 0.02 })
    }
    else {
      doc.image("./public/images/Checkboxes/blank-check-box.jpg", 400, 350, { scale: 0.02 })
    }
    doc.fontSize(12).text("Gecertificeert", 415, 351)

    doc.fontSize(17).text("Eindverslag:", 70, 400)
    doc.fontSize(12).text(item.eindbesluit, 70, 420)
    doc.end()
    res.send(res.data)
  })
});

router.get('/downloadVerslagTraining', function (req, res, next) {
  var id = url.parse(req.url, true).query.id

  trainingModel.findOne({ "_id": id }).exec(function (err, item) {
    if (err) { return next(err); }

    const doc = new PDFDocument;
    doc.pipe(res);

    doc.fontSize(30).text("Training", 250, 50)

    doc.fontSize(20).text("Algemeen", 50, 120)
    doc.moveTo(50, 150)
      .lineTo(550, 150)
      .stroke()

    var type = "Type: " + item.type
    doc.fontSize(12).text(type, 60, 180)

    var navNr = "Navigator nummer: " + item.navigatorNummer
    doc.fontSize(12).text(navNr, 350, 180)

    var type = "#Deelnemers: " + item.aantalDeelnemers
    doc.fontSize(12).text(type, 60, 210)

    var navNr = "#Sessies: " + item.aantalSessies
    doc.fontSize(12).text(navNr, 350, 210)

    var type = "Eigenaar: " + item.eigenaar
    doc.fontSize(12).text(type, 60, 240)

    var navNr = "Status: " + item.status
    doc.fontSize(12).text(navNr, 350, 240)

    doc.fontSize(20).text("Financieel", 50, 300)
    doc.moveTo(50, 330)
      .lineTo(550, 330)
      .stroke()

    var type = "Budget: €" + item.budget
    doc.fontSize(12).text(type, 60, 360)

    /*if (item.offerte) {
      doc.image("./public/images/Checkboxes/check-box.jpg", 60, 390, { scale: 0.02 })
    }
    else {
      doc.image("./public/images/Checkboxes/blank-check-box.jpg", 60, 390, { scale: 0.02 })
    }
    doc.fontSize(12).text("Offerte gemaakt", 85, 391)


    if (item.bestelbon) {
      doc.image("./public/images/Checkboxes/check-box.jpg", 240, 390, { scale: 0.02 })
    }
    else {
      doc.image("./public/images/Checkboxes/blank-check-box.jpg", 240, 390, { scale: 0.02 })
    }
    doc.fontSize(12).text("Bestelbon gemaakt", 265, 391)


    if (item.factuur) {
      doc.image("./public/images/Checkboxes/check-box.jpg", 425, 390, { scale: 0.02 })
    }
    else {
      doc.image("./public/images/Checkboxes/blank-check-box.jpg", 425, 390, { scale: 0.02 })
    }
    */
    doc.fontSize(12).text("Factuur gemaakt", 450, 391)

    var type = "EDB: " + item.edb
    doc.fontSize(12).text(type, 60, 420)

    var navNr = "Kostenplaats: " + item.kostenplaats
    doc.fontSize(12).text(navNr, 350, 420)

    if (item.subsidie) {
      doc.fontSize(20).text("Subsidies", 50, 480)
      doc.moveTo(50, 510)
        .lineTo(550, 510)
        .stroke()

      var type = "Subsidie instelling: " + item.subsidieInstelling
      doc.fontSize(12).text(type, 60, 540)

      var navNr = "Subsidie aanvraag: " + item.subsidieAanvraag
      doc.fontSize(12).text(navNr, 350, 540)

      var type = "Subsidie afhandeling: " + item.subsidieAfhandeling
      doc.fontSize(12).text(type, 60, 570)

      var navNr = "Subsidie bedrag: €" + item.subsidieBedrag
      doc.fontSize(12).text(navNr, 350, 570)

    }

    doc.end()
  })
});

router.get('/downloadKandidaatLijst', function (req, res, next) {
  var type_lijst = url.parse(req.url, true).query.type

  var van = getMonday(new Date(req.body.van));
  var tot = getMonday(new Date(req.body.tot));


  if (van == null & tot == null) {
    trainingModel.find({}).exec(function (err, list) {
      if (err) { return next(err); }
      downloadKandidaatLijst(list)
    })
  }
  else if (van == null) {
    trainingModel.find({ "datum": { "$lt": tot } }).exec(function (err, list) {
      if (err) { return next(err); }
      downloadKandidaatLijst(list)
    })
  }
  else if (tot == null) {
    trainingModel.find({ "datum": { "$gte": van } }).exec(function (err, list) {
      if (err) { return next(err); }
      downloadKandidaatLijst(list)
    })
  }
  else {
    trainingModel.find({ "datum": { "$gte": van, "$lt": tot } }).exec(function (err, list) {
      if (err) { return next(err); }
      downloadKandidaatLijst(list)
    })
  }

});

router.get('/downloadTrainingLijst', function (req, res, next) {
  var van = url.parse(req.url, true).query.van;
  var tot = url.parse(req.url, true).query.tot;

  if (van.toString() != "") {
    van = getMonday(new Date(van))
  } else {
    van = null
  }

  if (tot.toString() != "") {
    tot = getMonday(new Date(tot));
  } else {
    tot = null
  }

  var selection = false;

  if (van == null & tot == null) {
    trainingModel.find({}).exec(function (err, list) {
      if (err) { return next(err); }
      addToList(list, res, "Alle trainingen")
    })
  }
  else if (van == null) {
    trainingModel.find({ "datum": { "$elemMatch": { "$lt": tot } } }).exec(function (err, list) {
      if (err) { return next(err); }
      var title = "trainingen tot " + tot

      addToList(list, res, title)
    })
  }
  else if (tot == null, van, tot) {
    trainingModel.find({ "datum": { "$elemMatch": { "$gte": van } } }).exec(function (err, list) {
      if (err) { return res.end(); }
      var title = "trainingen van " + van
      addToList(list, res, title)
    })
  }
  else {
    trainingModel.find({ "datum": { "$elemMatch": { "$gte": van, "$lt": tot } } }).exec(function (err, list) {
      if (err) { return next(err); }
      var title = "trainingen van " + van + " tot " + tot
      addToList(list, res, title)
    })
  }
});

function addToList(list, res, title) {
  const doc = new PDFDocument;
  doc.pipe(res);

  doc.fontSize(20).text(title, 50, 120)


  doc.font('Helvetica-Bold').fontSize(12).text("NavigatorNr", 50, 170)
  doc.font('Helvetica-Bold').fontSize(12).text("Type", 130, 170)
  doc.font('Helvetica-Bold').fontSize(12).text("Eigenaar", 300, 170)
  doc.font('Helvetica-Bold').fontSize(12).text("#Dlnmrs", 440, 170)
  doc.font('Helvetica-Bold').fontSize(12).text("#Ses", 510, 170)
  doc.moveTo(50, 185)
    .lineTo(550, 185)
    .stroke()
  doc.moveTo(50, 188)
    .lineTo(550, 188)
    .stroke()
  var startHeight = 195
  var counter = 0
  var compensation = 0
  for (var i = 0; i < list.length; i++) {
    doc.font('Helvetica').fontSize(12).text(list[i].navigatorNummer, 50, startHeight + (i - compensation) * 20)
    doc.fontSize(12).text(list[i].type, 130, startHeight + (i - compensation) * 20)
    doc.fontSize(12).text(list[i].eigenaar, 300, startHeight + (i - compensation) * 20)
    doc.fontSize(12).text(list[i].aantalDeelnemers, 460, startHeight + (i - compensation) * 20)
    doc.fontSize(12).text(list[i].aantalSessies, 520, startHeight + (i - compensation) * 20)
    doc.moveTo(50, startHeight + 15 + (i - compensation) * 20)
      .lineTo(550, startHeight + 15 + (i - compensation) * 20)
      .stroke()

    if (i % 25 == 0 && i != 0) {
      startHeight = 50
      compensation = compensation + 24
      doc.addPage();
    }
  }


  doc.end()
  res.send(res.data)
}

function downloadKandidaatLijst(lijst) {
  var doc = new PdfDocument({ autoFirstPage: false }),
    table = new PdfTable(doc, { bottomMargin: 30 });
  table
    // add some plugins (here, a 'fit-to-width' for a column)
    .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
      column: 'description'
    }))
    // set defaults to your columns
    .setColumnsDefaults({
      headerBorder: 'B',
      align: 'right'
    })
    // add table columns
    .addColumns([
      {
        id: 'description',
        header: 'Product',
        align: 'left'
      },
      {
        id: 'quantity',
        header: 'Quantity',
        width: 50
      },
      {
        id: 'price',
        header: 'Price',
        width: 40
      },
      {
        id: 'total',
        header: 'Total',
        width: 70,
        renderer: function (tb, data) {
          return 'CHF ' + data.total;
        }
      }
    ])
    // add events (here, we draw headers on each new page)
    .onPageAdded(function (tb) {
      tb.addHeader();
    });

  // if no page already exists in your PDF, do not forget to add one
  pdf.addPage();

  // draw content, by passing data to the addBody method
  table.addBody([
    { description: 'Product 1', quantity: 1, price: 20.10, total: 20.10 },
    { description: 'Product 2', quantity: 4, price: 4.00, total: 16.00 },
    { description: 'Product 3', quantity: 2, price: 17.85, total: 35.70 }
  ]);
  doc.pipe(res);
  doc.end()
  res.send(res.data)
}

function getMonday(d) {
  d = new Date(d);
  console.log(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

router.get('/downloadOfferte', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  res.sendfile("./public/files/offertes/" + id + ".pdf")
});

router.get('/downloadBestelbon', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  res.sendfile("./public/files/bestelbonnen/" + id + ".pdf")
});

router.get('/downloadfacturen', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  res.sendfile("./public/files/facturen/" + id + ".pdf")
});
module.exports = router;
