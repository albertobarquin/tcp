'use strict';


const mongoose = require('mongoose')
global.config =require ('./config')
const app = require('./app')


//init bd & http server

mongoose.connect(global.config.db, (err, res) => {
    if(err) return console.log ('Error conectando a la base de datos:'+ err)
    console.log('db connection ok')
    app.listen(global.config.port, ()=>{
        console.log(`API REST escuchando en puerto ${global.config.port}`)
    })
})
