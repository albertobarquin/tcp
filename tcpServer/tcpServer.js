'use strict';

// Load the TCP Library
const net = require('net');
const crc = require('crc');
const UTCClock = require('utc-clock');
const SensorData =require('../models/sensorsData')


// importing Client class
const Client = require('./tcpClient');

class TcpServer {

    constructor (port, address) {

        this.port = port || 5000;
        this.address = address || '127.0.0.1';

        // Array to hold our currently connected clients
        this.clients = [];
    }

    /*
     * Broadcasts messages to the network
     * The clientSender doesn't receive it's own message
     */
    broadcast (message, clientSender) {
        this.clients.forEach((client) => {
            if (client === clientSender)
                return;
            client.receiveMessage(message);
        });
        console.log(message.replace(/\n+$/, ""));
    }

    /*
     * Starting the server
     * The callback is executed when the server finally inits
     */
    start (callback) {

        var server = this;
        const regexEnd = /END/;
        const regexData =/PCK_DAT([0-9A-Fa-f-+-.]*)PCK_FIN/;


        this.connection = net.createServer((socket) => {

            socket.setTimeout(global.abk_config.tcpTimeOut);

            var client = new Client(socket);


            if (!server._validateClient(client)) {
                client.socket.destroy();
                return;
            }

            // Broadcast the new connection
             console.log(`${client.name} connected.\n`);

            // Storing client for later usage
            server.clients.push(client);

            //socket events

            // Triggered on message received by this client
            socket.on('data', (data) => {

                // Broadcasting the message
               // server.broadcast(`${client.name} says: ${data}`, client);

                let data_str = data.toString();

                if (data_str.substr(0,11) == "PCK_IDE0500"){
                    this._sendConfig(client);
                    console.log ("Config sent")
                    return true
                }
                let dataPart = regexData.exec(data_str);
                if (dataPart != null && dataPart[1]){
                    console.log(dataPart[1]);
                    let tramaParseada = this._parse(dataPart[1]);
                    this._saveData(tramaParseada[4], tramaParseada[5], tramaParseada[6],tramaParseada[1], tramaParseada[19]);
                    console.log(tramaParseada.join(', '));
                    return true

                }

                if (regexEnd.exec(data_str)){
                    console.log('END encontrado')
                    client.receiveMessage('ADIOS');
                    return true
                }

            });

            // Triggered when this client disconnects
            socket.on('end', () => {
                // Removing the client from the list
                server.clients.splice(server.clients.indexOf(client), 1);
                // Broadcasting that this player left
                //server.broadcast(`${client.name} disconnected.\n`);
                console.log(`${client.name} disconnected.\n`);
            });

            // caso de error, se llama automáticamente a close
            socket.on('error', (err) => {
                console.log (`error en la conexion tcp: ${err}`)
            })

        });

        // starting the server
        this.connection.listen(this.port, this.address);

        // setuping the callback of the start function
        if (callback != undefined) {
            this.connection.on('listening', callback);
        }

    }


    _validateClient (client){
        return true;
    }

    _sendConfig(client){
        const sampleTime = global.abk_config.sampleTime || 1; //tiempo entre muestras en minutos
        const syncCount = global.abk_config.syncCount || 2 ;//número de muestras que acumula antes de enviar
        var clock = new UTCClock();
        //var now  =(parseInt(clock.now.ms()/1000, 10).toFixed(0)).toString(16).toUpperCase();//timestamp UTC en milisegundos pasado a segundos redondeado, en hexadecimal y con mayúsculas
        let now = (+(parseInt(clock.now.ms()/1000, 10).toFixed(0))).toString(16).toUpperCase()
        var sample_time_hex_segundos = (sampleTime*60).toString(16).toUpperCase();
        var confMassage = "PCK_CON";
        var dataMassage = this._lpad(now,8,'0');
        dataMassage +=this._lpad(sample_time_hex_segundos,4,'0');
        dataMassage += this._lpad(syncCount.toString(16).toUpperCase(),4 ,'0');

        var crc_msg = crc.crc8(dataMassage)

        dataMassage += this._lpad(crc_msg.toString(16).toUpperCase(),2,'0');
        confMassage += dataMassage


        console.log(confMassage + '---------'+sampleTime+'/'+syncCount+'------'+this._ahora());






        return client.receiveMessage(confMassage);
    }
    _lpad(str, length, opt_ch) {
        var str = String(str);
        var opt_ch = opt_ch || '0';

        while (str.length < length)
            str = opt_ch + str;

        return str;
    };
    _toInt(hex) {return parseInt(hex, 16);}
    _toDate(s) {return (new Date(s*1000)).toUTCString();}
    _ahora () {return new Date().toUTCString();}
    _hexToDate(hexMs) {return this._toDate(this._toInt(hexMs));}
    _calcTempC (raw) {
        let valorSensorDecimal = this._toInt(raw);
        let RNTC = (12.207 * valorSensorDecimal) / (3.3 - (0.0012207 * valorSensorDecimal));
        return ((3435 / (Math.log(RNTC / 10000) + 11.52104645313)) - 273.15).toFixed(2);
    }









    _saveData(medidaA, medidaB, medidaC, sc_id, time){
        let newSensorData = new SensorData();
        newSensorData.medidaA = medidaA;
        newSensorData.medidaB = medidaB;
        newSensorData.medidaC = medidaC;
        newSensorData.sc_id = sc_id;
        newSensorData.time = time;
        newSensorData.save((err,scSaved)=>{
            if (err) {console.log('error al guardar en la base de datos:'+err)}
            else {console.log('saved')}
        })

    }

    _parse (trama){
        const tramaParseada = [];

            tramaParseada[0] = this._hexToDate (trama.substr(0,8));       //fecha
            tramaParseada[1] = trama.substr(8,4);       //ID
            tramaParseada[2] = trama.substr(12,1);      //PID
            tramaParseada[3] = trama.substr(13,2);      //COD
            tramaParseada[4] = this._toInt(trama.substr(15,4));     //AN1
            tramaParseada[5] = this._toInt(trama.substr(19,4));     //AN2
            tramaParseada[6] = this._toInt(trama.substr(23,4));     //AN3
            tramaParseada[7] = this._calcTempC(trama.substr(27,4))+'ºC';     //Temperatura exterior //TODO ELIMINA LOS ºC QUE NO DESEAMOS UN STRING
            tramaParseada[8] = this._toInt(trama.substr(31,4));     //AN5
            tramaParseada[9] = this._toInt(trama.substr(35,4));     //AN6
            tramaParseada[10] = this._toInt(trama.substr(39,4));    //AN7
            tramaParseada[11] = this._toInt(trama.substr(43,4));    //AN8
            tramaParseada[12] = this._toInt(trama.substr(56,2));                 //temperatura interior
            tramaParseada[13] = this._toInt(trama.substr(58,4));     //bat

            tramaParseada[14] = this._toInt(trama.substr(0,8));       //fecha



        return tramaParseada;


    }

}

module.exports = TcpServer;

