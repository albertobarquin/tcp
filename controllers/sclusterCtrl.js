/**
 * Created by albertobarquin on 25/11/16.
 */
"use strict";

const Scluster =require('../models/scluster')

//geters
function getSclusters (req, res){
    Scluster.find({},(err, sclusters) => {
        if (err) return res.status(500).send({mesagge: 'Error: '+err})
        if (!sclusters) return res.status(404).send({mesagge: 'Error: '+err})

        res.status(200).send({sclusters})
    })
}

function getScluster (req, res) {
    let scId = req.params.scId
    Scluster.findByById(scId,(err, scluster) => {
        if (err) return res.status(500).send({mesagge: 'Error: '+err})
        if (!scluster) return res.status(404).send({mesagge: 'Error: '+err})

        res.status(200).send({scluster})

    })
}

function getSclusterData (req, res){
    let scId = req.params.scId

}

function getLastSclusterData(req, res){
    let scId = req.params.scId
    let lastN = req.params.lastN

}
function getSclusterDataByTime(req, res){
    let scId = req.params.scId
    let fromTime = req.params.fromTime
    let toTime = req.params.toTime


}

function getDataBySensor(req, res){
    let scId = req.params.scId
    let sensorId = req.params.sensorId

}
function getLastDataBySensor(req, res){
    let scId = req.params.scId
    let sensorId = req.params.sensorId
    let lastN = req.params.lastN

}
function getDataBySensorByTime(req, res){
    let scId = req.params.scId
    let sensorId = req.params.sensorId
    let fromTime = req.params.fromTime
    let toTime = req.params.toTime


}



//seters
function addScluster (req, res){
    console.log('Post sc')

    let newScluster = new Scluster()
    newScluster.name = req.body.name
    newScluster.adress = req.body.adress
    newScluster.description = req.body.description
    newScluster.save((err,scSaved)=>{
        if (err) res.status(500).send({message:'error al guardar en la base de datos:'+err})
        res.status(200).send({message: 'Location saved: '+scSaved})
    })
}

function updateCluster (req, res){
    let scId = req.params.scId

}


module.exports = {
    getSclusters,
    getScluster,
    getSclusterData,
    getLastSclusterData,
    getSclusterDataByTime,
    getDataBySensor,
    getDataBySensorByTime,
    getLastDataBySensor,
    addScluster,
    updateCluster

}
