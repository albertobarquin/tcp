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
            if (client === clientSender || client.id === 'E0500' || client.id === '')
                return;
            client.receiveMessage('\n'+message+'\n');
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
             server.broadcast(`\n\n\n${client.name} connected.\n`);
            //client.receiveMessage(`hola ${client.name}`);

            // Storing client for later usage
            server.clients.push(client);

            //socket events

            // Triggered on message received by this client
            socket.on('data', (data) => {



                let data_str = data.toString();

                if (data_str.trim() === ''){ return}

                if (data_str.substr(0,11) == "PCK_IDE0500"){
                    //console.log (data_str);
                    client.id= 'E0500';
                    this._sendConfig(client);
                    //server.broadcast(`${client.id} says: ${"Config sent"}`, client);
                    return true
                }
                else if (data_str.substr(0,7) == "PCK_EST" || data_str.substr(0,3) == "END"){

                    let dataPart = regexData.exec(data_str);
                    if (dataPart != null && dataPart[1]){
                        //console.log(dataPart[1]);
                        server.broadcast(`${client.id} says: ${dataPart[1]}`, client);

                        let tramaParseada = this._parse(dataPart[1]);
                        this._saveData(tramaParseada);
                        //console.log(tramaParseada.join(', '))
                        server.broadcast(`${client.id} says: ${this._joinObj(tramaParseada)}`, client);
                        return true

                    }

                    if (regexEnd.exec(data_str)){
                        console.log('END\n\n\n')
                        client.receiveMessage('ADIOS');
                        return true
                    }
                }
                else if (client.id =='' && data_str.trim() == "santiago@WOPR"){
                    client.receiveMessage('Hello  professor Falken\n');
                    client.receiveMessage(`La frecuencia de las medidas es de ${global.abk_config.sampleTime} y se envían en grupos de ${global.abk_config.syncCount}\n`);
                    client.receiveMessage('Vía telnet sólo hay acceso a los datos en tiempo real, así que debes esperar a que lleguen\n');
                    client.receiveMessage('Para cerrar sesión di adios\n\n\n\n\n');
                    client.id = 'santiago';
                    return true

                }
                else if (client.id =='' && data_str.trim() == "alberto@WOPR"){
                    client.receiveMessage('Hello  professor Falken\n');
                    client.receiveMessage(`La frecuencia de las medidas es de ${global.abk_config.sampleTime} y se envían en grupos de ${global.abk_config.syncCount}\n`);
                    client.receiveMessage('Vía telnet sólo hay acceso a los datos en tiempo real, así que debes esperar a que lleguen\n');
                    client.receiveMessage('Para cerrar sesión di adios\n\n\n\n\n');
                    client.id = 'alberto';
                    return true

                }
                else if (data_str.trim() == "adios" ||  client.id =='alberto' && data_str.trim() == "adios"){
                    client.receiveMessage('Vuelve pronto\n');
                    client.socket.end('bye');
                    return true
                }
                else if (client.id =='') {
                        client.receiveMessage(`Acceso denegado ${2-client.loginAtemps} intento/s restantes/s\n`);
                        client.loginAtemps ++;
                        if(client.loginAtemps>2) {client.socket.end('acceso no autorizado');}
                        return true
                }
                else {

                    server.broadcast(`${client.id} says: ${data_str}`, client);
                }


            });

            // Triggered when this client disconnects
            socket.on('end', () => {
                // Removing the client from the list
                server.clients.splice(server.clients.indexOf(client), 1);
                // Broadcasting that this player left
                server.broadcast(`${client.name} disconnected.\n`);
                //console.log(`${client.name} disconnected.\n`);
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
         str = String(str);
         opt_ch = opt_ch || '0';

        while (str.length < length)
            str = opt_ch + str;

        return str;
    };
    _toInt(hex) {return parseInt(hex, 16);}
    _toDate(s)  {return (new Date(s*1000)).toUTCString();}
    _ahora ()   {return new Date().toUTCString();}
    _hexToDate(hexMs) {return this._toDate(this._toInt(hexMs));}
    _calcTempC (raw) {
        let valorSensorDecimal = this._toInt(raw);
        let RNTC = (12.207 * valorSensorDecimal) / (3.3 - (0.0012207 * valorSensorDecimal));
        return ((3435 / (Math.log(RNTC / 10000) + 11.52104645313)) - 273.15).toFixed(2);
    }
    _joinObj (obj){
        let result ='';
        for (var prop in obj){
            result += prop +': '+ obj[prop]+' '
        }
        result +='\n'
        return result
    }


    _saveData(sensorData ){
        let newSensorData = new SensorData();
        newSensorData.tramaRaw = sensorData.tramaRaw;
        newSensorData.medidaA = sensorData.medidaA;
        newSensorData.medidaB =  sensorData.medidaB;
        newSensorData.medidaC =  sensorData.medidaC;
        newSensorData.sc_id   =  sensorData.sc_id;
        newSensorData.time    =  sensorData.time;
        newSensorData.tempExt =  sensorData.tempExt;
        newSensorData.tempInt =  sensorData.tempInt;
        newSensorData.bat     =  sensorData.bat;






        newSensorData.save((err,scSaved)=>{
            if (err) {console.log('error al guardar en la base de datos:'+err)}
            else {console.log('saved')}
        })

    }

    _parse (trama){
        const tramaParseada = [];
            tramaParseada['tramaRaw'] = trama;
            tramaParseada['fecha'] = this._hexToDate (trama.substr(0,8));       //fecha
            tramaParseada['sc_id'] = trama.substr(8,4);       //ID
            //tramaParseada['pid'] = trama.substr(12,1);      //PID
            //tramaParseada['cod'] = trama.substr(13,2);      //COD
            tramaParseada['medidaA'] = this._toInt(trama.substr(15,4));     //AN1
            tramaParseada['medidaB'] = this._toInt(trama.substr(19,4));     //AN2
            tramaParseada['medidaC'] = this._toInt(trama.substr(23,4));     //AN3
            tramaParseada['tempExt'] = this._calcTempC(trama.substr(27,4));     //Temperatura exterior
            //tramaParseada[8] = this._toInt(trama.substr(31,4));     //AN5
            //tramaParseada[9] = this._toInt(trama.substr(35,4));     //AN6
            //tramaParseada[10] = this._toInt(trama.substr(39,4));    //AN7
            //tramaParseada[11] = this._toInt(trama.substr(43,4));    //AN8
            tramaParseada['tempInt'] = this._toInt(trama.substr(56,2));                 //temperatura interior
            tramaParseada['bat'] = this._toInt(trama.substr(58,4));     //bat
            tramaParseada['time'] = this._toInt(trama.substr(0,8));       //fecha



        return tramaParseada;


    }

}

module.exports = TcpServer;

