var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// const { SerialPort } = require('serialport');
// const { Readline } = require('@serialport/parser-readline'); // Correct import statement

const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline');
const { Socket } = require('socket.io');
//const port = new SerialPort('COM12', { baudRate: 9600 }); // replace 'COM12' with your Arduino's serial port
const port = new SerialPort({
    path: 'COM12',
    baudRate:9600,
    parser: new ReadlineParser("\n")
  });

// var parser = port.pipe(new Readline({ delimiter: '\r\n' }));

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

app.use(express.static(__dirname));

// io.on("connection", (socket)=>)

// parser.on('data', function(data){
//   io.emit('arduino:data', data);
// });
// Existing code...
io.on('connection', (socket) => {
    console.log('A user connected');
    parser.on('data', function(data){
      socket.emit('arduino:data', data);
    });
    socket.on('end:game',()=>{
      console.log("End game logic here");
    })
});
  

// parser.on('data', console.log);

http.listen(8000, function(){
  console.log('listening on *:8000');
});

