"use strict";
const express = require('express');
const api = express.Router();
const SclusterCtrl = require('../controllers/sclusterCtrl');
const SensorDataCtrl = require('../controllers/sensorDataCtrl');

api.get('/scs',SclusterCtrl.getSclusters );
//api.get('/sc/:scId',SclusterCtrl.getSclusterData);
//api.post('/sc', SclusterCtrl.addScluster);
//api.put('/sc/:scId', SclusterCtrl.updateCluster);

api.get('/sc/:scId/data', SensorDataCtrl.getSclusterData);
api.get('/sc/:scId/data/from/:fromT/to/:toT',SensorDataCtrl.getSclusterDataByTime );
api.get('/sc/:scId/data/last/:lastN', SclusterCtrl.getLastSclusterData);

//api.get('/sc/:scId/sensor/:sensorID/data',SclusterCtrl.getDataBySensor);
//api.get('/sc/:scId/sensor/:sensorID/from/:fromTime/to/:toTime', SclusterCtrl.getDataBySensorByTime);
//api.get('/sc/:scId/sensor/:sensorID/last/:lastN',SclusterCtrl.getLastDataBySensor);

module.exports = api;
