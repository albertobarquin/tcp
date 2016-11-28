/**
 * Created by albertobarquin on 25/11/16.
 */
'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const SclusterSchema = Schema({
    name: String,
    adress: String,
    description:String
})
mongoose.model
module.exports = mongoose.model('Scluster', SclusterSchema)



