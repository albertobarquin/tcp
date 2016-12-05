'use strict';


const mongoose = require('mongoose')
global.abk_config =require ('./config')
const app = require('./app')


// importing Server class
const TcpServer = require('./tcpServer/tcpServer');



var tcpserver = new TcpServer(global.abk_config.tcpPort, global.abk_config.tcpAdress);

// Starting our server
tcpserver.start(() => {
    console.log(`Tcp Server escuchando en puerto: ${global.abk_config.tcpAdress}:${global.abk_config.tcpPort}`);
});

//init bd & http server
/**
mongoose.connect(global.abk_config.db, (err, res) => {
    if(err) return console.log ('Error conectando a la base de datos:'+ err)
    console.log('db connection ok')
    app.listen(global.abk_config.port, ()=>{
        console.log(`API REST escuchando en puerto ${global.abk_config.port}`)
    })
})





