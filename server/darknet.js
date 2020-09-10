var cp = require('child_process')
var fs = require('fs');

function spawn(name, cmd, args) {
  var waitingQueue = []
  var working = {}
  var yoloReady = false

  var yolo = cp.spawn(cmd, args)
  var filename = null
  yolo.stdout.on('data', (data) => {

    if (data.toString().includes("./uploads/")) {
      filename = data.toString().split(':')[0]
    }
    var lines = data.toString().split('\n')

    for (var i = 0; i < lines.length; i++) {
      data = lines[i]
      if (data.includes("%")) {
        working[filename].data.push(data)
      } else if (data.includes('Enter Image Path')) {
        if (working[filename] !== undefined && working[filename].data != undefined && working[filename].data.length !== 0) {
          working[filename].callback(
            working[filename].data
          )
        }
        // ready to start working again
        yoloReady = true
        console.log(`-- ${name} detector ready --`)
      }
    }
  })

  yolo.on('close', (code) => {
    console.log(`-- ${name} detector exited --`)
  })

  function detect(filename, callback) {
    // add the file and queue it for processing
    waitingQueue.unshift({
      filename: filename,
      callback: callback
    })
  }

  function run() {
    // active waiting for new files to work on
    if (yoloReady) {
      var todo = waitingQueue.pop()
      if (!todo) { return setTimeout(run, 1000) }
      console.log(`-- ${name} processing --: ${todo.filename}`)
      yoloReady = false
      working[todo.filename] = {
        callback: todo.callback,
        data: []
      }
      yolo.stdin.write(`${todo.filename}\n`)
    }
    setTimeout(run, 1000)
  }
  run()
  return detect
}

module.exports = {
  'yolo': spawn('yolo', './darknet', [
    'detector', 'test', './obj.data', './prekes.cfg', './prekes_last.weights', '-dont_show', '-ext_output'
  ])
}
