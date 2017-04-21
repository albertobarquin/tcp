/**
 * Created by albertobarquin on 5/12/16.
 */
'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SensorDataSchema = Schema({
    tramaRaw:String,
    medidaA:Number,
    medidaB:Number,
    medidaC:Number,
    clino1:Number,
    clino2:Number,
    clino3:Number,
    sc_id:String,
    cod:String,
    time:Number,
    tempExt:Number,
    humidity:Number,
    tempInt:Number,
    bat:Number
});
module.exports = mongoose.model('SensorData', SensorDataSchema);



