var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline');
const { Socket } = require('socket.io');
// replace 'COM12' with your Arduino's serial port
const port = new SerialPort({
    path: 'COM12',
    baudRate:9600,
    parser: new ReadlineParser("\n")
  });


const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

app.use(express.static(__dirname));

//Establish socket connection 

io.on('connection', (socket) => {
    console.log('A user connected');
    parser.on('data', function(data){
      socket.emit('arduino:data', data);
    });
    socket.on('end:game',()=>{
      console.log("End game logic here");
    })
});
  
//Set up port configure in the frontend

http.listen(8000, function(){
  console.log('listening on *:8000');
});

