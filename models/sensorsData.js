/**
 * Created by albertobarquin on 5/12/16.
 */
'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const SensorDataSchema = Schema({
    medidaA:Number,
    medidaB:Number,
    medidaC:Number,
    sc_id:String,
    time:Number
})
mongoose.model
module.exports = mongoose.model('SensorData', SensorDataSchema)



