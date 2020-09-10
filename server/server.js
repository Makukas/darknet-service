var darknet = require('./darknet.js')
var express = require('express')
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
var fs = require('fs')

var app = express()

app.post('/yolo', upload.single('photo'), function (req, res, next) {
  var filename = `./${req.file.destination}${req.file.filename}`
  console.log(`-- yolo received --: ${filename}`)
  darknet.yolo(filename, data => {
    res.send(data)
    fs.unlink(filename, d => { })
  })

})

app.get('/status', function (req, res, next) {
  res.send({ message: "darknet is live" });
  return;
})

app.listen(3000, function () {
  console.log('darknet app listening on port :3000')
})
