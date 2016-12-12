/**
 * Created by albertobarquin on 28/11/16.
 */
module.exports = {
    port : process.env.REST_PORT || 3000,
    tcpPort: process.env.TCP_PORT || 55893,
    tcpAdress: "0.0.0.0",
    db : process.env.DB || 'mongodb://JohnL:3557-7334-BBbb#-BDCAP@127.0.0.1:27017/cloudapp', //'mongodb://username:password@host:port/database?options...');
    tcpTimeOut : 60*1000,
    sampleTime : 1,
    syncCount : 5
};

