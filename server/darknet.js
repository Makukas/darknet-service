var cp = require('child_process')

function spawn (name, cmd, args) {
  var waitingQueue = []
  var working = {}
  var yoloReady = false

  var yolo = cp.spawn(cmd, args)

  yolo.stdout.on('data', (data) => {
    var lines = data.toString().split('\n')
    var filename = null
    for (var i = 0; i < lines.length; i++) {
      data = lines[i]
      if (data.includes('filename')) {
        // data line update the file data list
        data = JSON.parse(data)
        filename = data.filename
        delete data.filename
        working[filename].data.push(data)
      } else if (data.includes('detection done')) {
        // detection just finished
        filename = data.split(':')[1]
        working[filename].callback(
          working[filename].data
        )
      } else if (data.includes('Enter Image Path')) {
        // ready to start working again
        yoloReady = true
        console.log(`-- ${name} detector ready --`)
      }
    }
  })

  yolo.on('close', (code) => {
    console.log(`-- ${name} detector exited --`)
  })

  function detect (filename, callback) {
    // add the file and queue it for processing
    waitingQueue.unshift({
      filename: filename,
      callback: callback
    })
  }

  function run () {
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
    'detector', 'test', 'cfg/coco.data', 'cfg/yolov3.cfg', '/yolov3.weights'
  ]),
  'yolo-tiny': spawn('yolo-tiny', './darknet', [
    'detector', 'test', 'cfg/voc.data', 'cfg/yolov3-tiny.cfg', '/yolov3-tiny.weights'
  ]),
  'yolo-bellmark': spawn('yolo-bellmark', './darknet', [
    'detector', 'test', 'cfg/Bellmark.data', 'cfg/Bellmark.cfg', '/Bellmark_best.weights'
  ])
}
