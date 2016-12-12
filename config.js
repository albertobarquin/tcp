/**
 * Created by albertobarquin on 28/11/16.
 */
module.exports = {
    port : process.env.REST_PORT || 3000,
    tcpPort: process.env.TCP_PORT || 55893,
    tcpAdress: "0.0.0.0",
    db : process.env.DB || 'mongodb://JohnL:3557-7334-BBbb#-BDCAP@127.0.0.1:27017/cloudapp', //'mongodb://username:password@host:port/database?options...');
    tcpTimeOut : 60*1000
};
/**
timestamp crudo:584A8A16
timestamp:584A8A16
sample_time_hex_segundos:003C
syncCount:0002
crc crudo = 155
crc:9B
PCK_CON 584A8A16 003C 0002 9B
PCK_CON 584A93EE 003C 0002 65
PCK_CON 584A947A 003C 0002 FC
PCK_CON 584A94F3 003C 0002 03
 **/
