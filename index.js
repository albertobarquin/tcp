'use strict';


const mongoose = require('mongoose')
global.config =require ('./config')
const app = require('./app')


// importing Server class
const TcpServer = require('./tcpServer/tcpServer');

// Our configuration
const PORT = 55893;
const ADDRESS = "0.0.0.0"//"127.0.0.1"

var tcpserver = new TcpServer(PORT, ADDRESS);

// Starting our server
tcpserver.start(() => {
    console.log(`Tcp Server escuchando en puerto: ${ADDRESS}:${PORT}`);
});

//init bd & http server

mongoose.connect(global.config.db, (err, res) => {
    if(err) return console.log ('Error conectando a la base de datos:'+ err)
    console.log('db connection ok')
    app.listen(global.config.port, ()=>{
        console.log(`API REST escuchando en puerto ${global.config.port}`)
    })
})





