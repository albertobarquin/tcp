'use strict';

const express = require('express')
const bodyParser = require('body-parser')

const app = express();
const port = process.env.PORT || 3000
const routePrefix = '/api/v1/'

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.listen(port, ()=>{
    console.log(`API REST escuchando en puerto ${port}`)
})

//Routes

    // Get all locations
    app.get(`${routePrefix}locations`, (req, res) =>{
        res.status(200).send({message: "Get all locations"})
    })
    //Get a location metadata
    app.get(`${routePrefix}location/:locId`, (req, res) =>{
        res.status(200).send({message: "hola mundo"})
    })


    //Add new location
    app.post(`${routePrefix}location/`, (req, res) =>{
        res.status(200).send({message: "Add new location"})
        console.log(req.body)
    })
    //update a location
    app.put(`${routePrefix}location/:locId`, (req, res) =>{
        res.status(200).send({message: "hola mundo"})
    })


    //get all data from al location sensors
    app.get(`${routePrefix}location/:locId/data`, (req, res) =>{
        res.status(200).send({message: "hola mundo"})
    })
   //get data from all location sensors by time period
    app.get(`${routePrefix}location/:locId/data/from/:from/to/:to`, (req, res) =>{
        res.status(200).send({message: "hola mundo"})
    })

    //get last n data from all location sensors
    app.get(`${routePrefix}location/:locId/data/last/:last`, (req, res) =>{
        res.status(200).send({message: "hola mundo"})
    })


    //get all data from al location one sensor
    app.get(`${routePrefix}location/:locId/sensor/:sensorID/data`, (req, res) =>{
        res.send.status(200).send({message: "hola mundo"})
    })
    //get data from one sensor by time period
    app.get(`${routePrefix}location/:locId/data/:sensorID/from/:from/to/:to`, (req, res) =>{
        res.send.status(200).send({message: "hola mundo"})
    })

    //get last n data from one sensor
    app.get(`${routePrefix}location/:locId/data/:sensorID/last/:last`, (req, res) =>{
        res.send.status(200).send({message: "hola mundo"})
    })

