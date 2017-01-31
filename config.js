/**
 * Created by albertobarquin on 28/11/16.
 */
module.exports = {
    port : process.env.REST_PORT || 3000,
    tcpPort: process.env.TCP_PORT || 55893,
    tcpAdress: "0.0.0.0",
    db : process.env.DB || 'mongodb://127.0.0.1:27017/cloudsystratec', //'mongodb://username:password@host:port/database?options...'); 'mongodb://JohnL:lodesiempre-BDCAP@127.0.0.1:27017/cloudapp'
    tcpTimeOut : 60*1000,
    sampleTime : 1,
    syncCount : 10
};

