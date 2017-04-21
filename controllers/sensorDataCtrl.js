/**
 * Created by albertobarquin on 15/12/16.
 */


"use strict";

const SensorData =require('../models/sensorsData')

//geters
function getSclusterData (req, res){
    let scId = req.params.scId;

    var query =SensorData.find({'sc_id':scId}).
        where('time').gt(1481790122).
        select({'time': 1, 'clino1':1,'clino2':1, 'clino3':1, 'tempExt':1}).
       // limit(last).
        exec((err, sensorData) => {
            if (err) return res.status(500).send({mesagge: 'Error: '+err})
                if (!sensorData) return res.status(404).send({mesagge: 'Error: '+err})

                res.status(200).send({sensorData})
            });
}
function getLastSclusterData (req, res){
    let scId = req.params.scId;
    let last = req.params.lastN;
    var query =SensorData.find({'sc_id':scId}).
    where('time').gt(1481790122).
        limit(10).
    select({'time': 1, 'clino1':1,'clino2':1, 'clino3':1, 'tempExt':1}).

    exec((err, sensorData) => {
        if (err) return res.status(500).send({mesagge: 'Error: '+err})
        if (!sensorData) return res.status(404).send({mesagge: 'Error: '+err})

        res.status(200).send({sensorData})
    });
}
function getSclusterDataByTime (req, res){
    let scId = req.params.scId;
    let fromT = req.params.fromT;
    let toT = req.params.toT;
    var query =SensorData.find({'sc_id':scId}).
    where('time').gt(fromT).lt(toT).
    sort('time').
    select({'time': 1, 'clino1':1,'clino2':1, 'clino3':1, 'tempExt':1}).
    exec((err, sensorData) => {
        if (err) return res.status(500).send({mesagge: 'Error: '+err})
        if (!sensorData) return res.status(404).send({mesagge: 'Error: '+err})

        res.status(200).send({sensorData})
    });
}

//seters



module.exports = {
    getSclusterData,
    getSclusterDataByTime

}
