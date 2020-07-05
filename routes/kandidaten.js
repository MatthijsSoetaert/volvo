var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
var url = require('url');
const Jimp = require("jimp")

var fs = require('fs')
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline
} = require('@azure/storage-blob');
var azure = require('azure');
var blobs = azure.createBlobService();

const sharedKeyCredential = new StorageSharedKeyCredential(
  "storagevolvoaccount",
  "qugar2WbsESRrcpZqS6GNPNl48PnwJXWZL2mw24o5d1FWlC8Vb5KXRi/8cFZaucX/cKPKZp0ubOF9zc2Z+lstA==");
const pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient = new BlobServiceClient(
  `https://storagevolvoaccount.blob.core.windows.net`,
  pipeline
);
var kandidaatModel = require('../models/kandidaatModel')

/* GET home page. */
router.get('/', function (req, res, next) {
  kandidaatModel.find().exec(function (err, list) {
    if (err) { return next(err); }
    res.render('./kandidaten/kandidaten', { kandidaten: list })
  })
});

//GET KANDIDATENPW
router.get('/kandidatenpw', function (req, res, next) {
  var maandag = getMonday(new Date())
  maandag.setDate(maandag.getDate() - 1);
  maandag.setHours(24, 00, 00, 000)
  console.log(maandag)
  kandidaatModel.find({ "datum": maandag }).exec(function (err, list) {
    if (err) { return next(err); }
    console.log(list)
    res.render('./kandidaten/kandidatenpw', { kandidaten: list })
  })
});

//POST KANDIDATENPW
router.post('/kandidatenpw', function (req, res, next) {
  var maandag = getMonday(req.body.week)
  var tomorrow = new Date()
  tomorrow.setDate(maandag.getDate() + 1)
  console.log(maandag)

  kandidaatModel.find({ "datum": { "$gte": maandag, "$lt": tomorrow } }).exec(function (err, list) {
    if (err) { return next(err); }
    console.log(list)
    res.render('./kandidaten/kandidatenpw', { kandidaten: list })
  })
});

//ADD GET
router.get('/add', function (req, res, next) {
  res.render('./kandidaten/add')
});

//ADD POST
router.post('/add', async function (req, res, next) {
  addNewKandidaat(req, res)
  //OPSLAAN EN DAN ID VAN RECORD MEEGEVEN ALS ARGUMENT
  res.redirect("/kandidaten")
});

//DETAILS GET
router.get('/detail', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  kandidaatModel.find({ "_id": id }).exec(function (err, list) {
    if (err) { return next(err); }
    res.render('./kandidaten/details', { kandidaat: list[0] })
  })
});

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

router.get('/getProfilePicture', async function (req, res, next) {
  var id = url.parse(req.url, true).query.id
 /* var downloaded = ""
  try{
    const containerClient = await blobServiceClient.getContainerClient("profilepictures");
    const blobClient = await containerClient.getBlobClient(id);
    // Download and convert a blob to a string
    downloadBlockBlobResponse = await blobClient.download();
    await streamToString(downloadBlockBlobResponse.readableStreamBody).then(function(downloaded){
      var bitmap = new Buffer.from(downloaded,'base64');
      res.writeHead(200,{
        'Content-Type': 'image/png',
        'Content-Length': bitmap.length
      })
      var s = fs.createReadStream(downloaded);
      s.pipe(downloaded)
    });
  }catch(err){
    console.log(err)
  }
  */
 var blobs = azure.createBlobService();
 try{
  var tempUrl = blobs.getBlobUrl('profilepictures', id,  { AccessPolicy: {
    Start: Date.now(),
    Expiry: azure.date.minutesFromNow(60),
    Permissions: azure.Constants.BlobConstants.SharedAccessPermissions.READ
  }});
  res.send(tempUrl)
 }
 catch(err){
   console.log(err)
 }

});


//EDIT GET
router.get('/edit', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  kandidaatModel.find({ "_id": id }).exec(function (err, list) {
    if (err) { return next(err); }
    res.render('./kandidaten/edit', { kandidaat: list[0] })
  })
});

//EDIT POST
router.post('/edit', function (req, res, next) {
  updateKandidaat(req);
  redirecturl = "/kandidaten/detail?id=" + req.body.id
  res.redirect(redirecturl)

});

//REMOVE
router.get('/remove', function (req, res, next) {
  var id = url.parse(req.url, true).query.id
  kandidaatModel.find({ "_id": id }).remove(function (err, list) {
    if (err) { return next(err); }
  })
  res.redirect("/kandidaten")
});

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

function updateKandidaat(req) {
  var rehire = "";
  var reguliere = "";
  var werkplekleren = "";
  var cc = "";
  var veiligheid = "";
  var takel = "";
  var gecertificeerd = "";

  if (req.body.rehire == undefined) {
    rehire = false;
  } else {
    rehire = true;
  }

  if (req.body.reguliere == undefined) {
    reguliere = false;
  } else {
    reguliere = true;
  }

  if (req.body.werkplekleren == undefined) {
    werkplekleren = false;
  } else {
    werkplekleren = true;
  }

  if (req.body.cc == undefined) {
    cc = false;
  } else {
    cc = true;
  }

  if (req.body.veiligheid == undefined) {
    veiligheid = false;
  } else {
    veiligheid = true;
  }


  if (req.body.takel == undefined) {
    takel = false;
  } else {
    takel = true;
  }

  if (req.body.gecertificeerd == undefined) {
    gecertificeerd = false;
  } else {
    gecertificeerd = true;
  }

  console.log(req.body.id)
  var maandag = getMonday(req.body.week)
  var kandidaat = {
    datum: maandag,
    voornaam: req.body.voornaam,
    familienaam: req.body.familienaam,
    werkplekleren: werkplekleren,
    rehire: rehire,
    reguliere: reguliere,
    veiligheid: veiligheid,
    veiligheidscore: req.body.veiligheidscore,
    testing: "",
    cc: cc,
    ccscore: req.body.ccscore,
    takel: takel,
    takelscore: req.body.takelscore,
    gecertificeerd: gecertificeerd,
    feedback1: req.body.feedback1,
    feedback2: req.body.feedback2,
    feedback3: req.body.feedback3,
    feedback4: req.body.feedback4,
    feedback5: req.body.feedback5,
    eindbesluit: req.body.eindbesluit,
  }

  kandidaatModel.updateOne({ "_id": req.body.id }, kandidaat, function (err, book) {
    if (err) return console.error(err);
    console.log(kandidaat) + " opgeslagen"
  })

  return kandidaat
}

async function addNewKandidaat(req, res) {
  var rehire = "";
  var reguliere = "";
  var werkplekleren = "";
  var cc = "";
  var veiligheid = "";
  var takel = "";
  var gecertificeerd = "";

  console.log(req.body.rehire)
  console.log(req.body.reguliere)
  if (req.body.rehire == undefined) {
    rehire = false;
  } else {
    rehire = true;
  }

  if (req.body.reguliere == undefined) {
    reguliere = false;
  } else {
    reguliere = true;
  }

  if (req.body.werkplekleren == undefined) {
    werkplekleren = false;
  } else {
    werkplekleren = true;
  }

  if (req.body.cc == undefined) {
    cc = false;
  } else {
    cc = true;
  }

  if (req.body.veiligheid == undefined) {
    veiligheid = false;
  } else {
    veiligheid = true;
  }


  if (req.body.takel == undefined) {
    takel = false;
  } else {
    takel = true;
  }

  if (req.body.gecertificeerd == undefined) {
    gecertificeerd = false;
  } else {
    gecertificeerd = true;
  }

  profilePicture = req.files.profilePicture
  var ext = profilePicture.name.split(".")[1]

  var maandag = getMonday(req.body.week)
  var kandidaat = new kandidaatModel({
    datum: maandag,
    voornaam: req.body.voornaam,
    familienaam: req.body.familienaam,
    werkplekleren: werkplekleren,
    rehire: rehire,
    reguliere: reguliere,
    veiligheid: veiligheid,
    veiligheidscore: req.body.veiligheidscore,
    testing: "",
    cc: cc,
    ccscore: req.body.ccscore,
    takel: takel,
    takelscore: req.body.takelscore,
    gecertificeerd: gecertificeerd,
    feedback1: "",
    feedback2: "",
    feedback3: "",
    feedback4: "",
    feedback5: "",
    eindbesluit: "",
    imgext: ext

  })

  kandidaat.save(async function (err, kandidaat) {
    if (err) return console.error(err);

    const containerClient = blobServiceClient.getContainerClient("profilepictures")
    const blockBlobClient = containerClient.getBlockBlobClient(kandidaat._id + "." + ext)

    // Upload data to the blob
    const data = profilePicture;
    console.log(data)
    const uploadBlobResponse = await blockBlobClient.upload(data.data, data.data.length);
    console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);


    /*if (ext == "png") {
      Jimp.read(picturePath + "png", function (err, image) {
        if (err) {
          console.log(err)
        } else {
          image.write(picturePath + "jpg")
        }
      })
    }*/

  })

  return kandidaat
}

module.exports = router;
