'use strict';

// Load the TCP Library
const net = require('net');
const crc = require('crc');
const UTCClock = require('utc-clock');
const SensorData =require('../models/sensorsData');


// importing Client class
const Client = require('./tcpClient');

class TcpServer {

    constructor (port, address) {

        this.port = port || 5000;
        this.address = address || '127.0.0.1';
        this.clients = [];
    }

    /*
     * Broadcasts messages to the network
     * The clientSender doesn't receive it's own message
     */
    broadcast (message, clientSender) {//desactivado
        this.clients.forEach((client) => {
            if (client === clientSender || client.id === 'E0500' || client.id === '')
                return;
            //client.receiveMessage('\n'+message+'\n');
        });
        //console.log(message.replace(/\n+$/, ""));
    }

    /*
     * Starting the server
     * The callback is executed when the server finally inits
     */
    start (callback) {

        let server = this;

        const regexEnd = /(END)/;
        const regexData =/PCK_DAT([0-9A-Fa-f-+-.]*)PCK_FIN/;


        this.connection = net.createServer((socket) => {

            socket.setTimeout(global.abk_config.tcpTimeOut);
            //console.log('timeOut: '+global.abk_config.tcpTimeOut)

            let client = new Client(socket);

            if (!server._validateClient(client)) {
                client.socket.destroy();
                return;
            }

            // Broadcast the new connection
            // server.broadcast(`\n\n\n${client.name} connected.\n`);
            //client.receiveMessage(`hola ${client.name}`);

            // Storing client for later usage
            server.clients.push(client);

            //socket events

            // Triggered on message received by this client
            socket.on('data', (data) => {
                let data_str = data.toString();

                if (data_str.trim() === ''){ return}


                console.log('\tPKCH= '+data_str.substr(0,11)+'\t'+this._ahora()+'\n\n');

                if (data_str.substr(0,7) == "PCK_IDE"){
                //es la cabecera de los mensajes -> enviamos configuracion
                    client.id= data_str.substr(7,4);

                    this._sendConfig(client);
                    console.log('\t ' +client.id+' CONFIG SENT'+'\t'+this._ahora()+'\n');
                    return true
                }

                if (data_str.substr(0,7) == "PCK_EST"){
                    //console.log ('Trama de datos');

                    let dataPart = regexData.exec(data_str);
                    if (dataPart != null && dataPart[1]){
                        //console.log('\t\t'+this._ahora()+'\t'+client.id+'\n');
                        //server.broadcast(`${client.id} says: ${dataPart[1]}`, client);

                        let tramaParseada = this._parse(dataPart[1]);

                        this._saveData(tramaParseada);

                        console.log('\t'+this._joinObj(tramaParseada));
                        }

                        //server.broadcast(`${client.id} says: ${this._joinObj(tramaParseada)}`, client);


                    }
                if (regexEnd.exec(data_str)){
                    console.log('\tEND Recibido'+'\t'+this._ahora()+'\t'+client.id+'\n');

                    client.receiveMessage('ADIOS', ()=>{
                        console.log('\tADIOS sended'+'\t'+this._ahora()+'\t'+client.id+'\n');
                        setTimeout(()=>{
                            client.socket.end();
                        },1000)
                    });


                }//fin de END encontrado

                return true

            });// fin de on Data

            // Triggered when this client disconnects
            socket.on('end', () => {
                // Removing the client from the list
                server.clients.splice(server.clients.indexOf(client), 1);
                // Broadcasting that this player left
                //server.broadcast(`${client.name} disconnected.\n`);
                console.log(`\t${client.name} disconnected.\t${this._ahora()}\n`);
            });

            // caso de error, se llama automáticamente a close
            socket.on('error', (err) => {
                console.log (`\n\n\t\tERROR en la conexion tcp: ${err}\n\n`)
            });
            socket.on('close', (data) => {
                console.log (`Evento close:  ${socket.remoteAddress} :: ${socket.remotePort} hadError: ${data} \t${client.id}\n\n\n`)

            });


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


            let sampleTime = 1;
            let syncCount = 2;



        if (client.id == '0500'){
             sampleTime = global.abk_config.sampleTime || 1; //tiempo entre muestras en minutos
             syncCount = global.abk_config.syncCount || 2 ;//número de muestras que acumula antes de enviar
        }
        else if(client.id == '0501'){
             sampleTime = global.abk_config.sampleTime1 || 1; //tiempo entre muestras en minutos
             syncCount = global.abk_config.syncCount1 || 2 ;//número de muestras que acumula antes de enviar
        }

        let clock = new UTCClock();
        let ajusteBisiesto = (clock.now.ms()/1000)+86400; //TODO sacar esto a un ajuste en la base dedatos y que no se aplique en años bisiestos

        let now = (+(parseInt(ajusteBisiesto, 10).toFixed(0))).toString(16).toUpperCase();
        let sample_time_hex_segundos = (sampleTime*60).toString(16).toUpperCase();
        let confMassage = "PCK_CON";
        let dataMassage = this._lpad(now,8,'0');
        dataMassage +=this._lpad(sample_time_hex_segundos,4,'0');
        dataMassage += this._lpad(syncCount.toString(16).toUpperCase(),4 ,'0');

        let crc_msg = crc.crc8(dataMassage)

        dataMassage += this._lpad(crc_msg.toString(16).toUpperCase(),2,'0');
        confMassage += dataMassage;


        console.log('\tConfig paket: '+confMassage + '\t'+'sampletime: '+sampleTime+'\tsyncCount: '+syncCount+'\t'+this._ahora());






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
    _parseClinometro  (rawClino, num){

            let result = null;
            let _milivoltsClino = function (rawClino){
                return ((-2500/2048)*rawClino) + 2500;
            };

            let miliVoltsClino = _milivoltsClino (rawClino);

            switch (num){
                case 1:
                    result = (2.697847E-3 + (4.035098E-3 * miliVoltsClino)+( -5.029802E-10 * Math.pow(miliVoltsClino,2) )+( 3.005975E-12 * Math.pow(miliVoltsClino,3)) - 0.337640758783).toFixed(1);
                    break;

                case 2:
                    result = (1.883518E-4 + (4.030367E-3 * miliVoltsClino)+( -6.812133E-10 * Math.pow(miliVoltsClino,2) )+( 2.733715E-12 * Math.pow(miliVoltsClino,3)) - 0.182222832920).toFixed(1);
                    break;

                case 3:

                    result = (4.488158E-4 + (4.024531E-3 * miliVoltsClino)+( -1.087035E-9  * Math.pow(miliVoltsClino,2) )+( 2.994728E-12 * Math.pow(miliVoltsClino,3)) + 0.628422115871).toFixed(1);
                    break;
            }
            return result
        }
    _joinObj (obj){
        let result ='';
        for (let prop in obj){
            result += prop +': '+ obj[prop]+'\n\t '
        }
        result +='\n';
        return result
    }


    _saveData(sensorData ){
        let newSensorData = new SensorData();



        newSensorData.tramaRaw = sensorData.tramaRaw;

        newSensorData.medidaA = sensorData.medidaA || 0 ;
        newSensorData.medidaB =  sensorData.medidaB || 0;
        newSensorData.medidaC =  sensorData.medidaC || 0;

        newSensorData.clino1 =  sensorData.clino1 || 0;
        newSensorData.clino2 =  sensorData.clino2 || 0;
        newSensorData.clino3 =  sensorData.clino3 || 0;


        newSensorData.sc_id   =  sensorData.sc_id;
        newSensorData.cod   =  sensorData.cod || '00';
        newSensorData.time    =  sensorData.time;
        newSensorData.tempExt =  sensorData.tempExt || 0;
        newSensorData.tempInt =  sensorData.tempInt || 0;
        newSensorData.humidity = sensorData.humidity || 0;
        newSensorData.bat     =  sensorData.bat || 0;






        newSensorData.save((err,scSaved)=>{
            if (err) {console.log('ERROR al guardar en la base de datos:'+err+'\t'+this._ahora()+'\n')}
            else {console.log('\tDB: Saved OK '+'\t'+this._ahora()+'\t'+'\n')}
        })

    }

    _parse (trama){
        const tramaParseada = [];

             tramaParseada['sc_id'] = trama.substr(8,4);       //ID
            switch (tramaParseada['sc_id']) {

                case '0500':
                    tramaParseada['tramaRaw'] = trama;
                    tramaParseada['fecha'] = this._hexToDate (trama.substr(0,8));       //fecha
                    tramaParseada['sc_id'] = trama.substr(8,4);       //ID
                    tramaParseada['pid'] = trama.substr(12,1);      //PID
                    tramaParseada['cod'] = trama.substr(13,2);      //COD

                    tramaParseada['medidaA'] = this._toInt(trama.substr(15,4));     //AN1
                    tramaParseada['medidaB'] = this._toInt(trama.substr(19,4));     //AN2
                    tramaParseada['medidaC'] = this._toInt(trama.substr(23,4));     //AN3

                    tramaParseada['clino1'] = this._parseClinometro(tramaParseada['medidaA'],1);
                    tramaParseada['clino2'] = this._parseClinometro(tramaParseada['medidaB'],2);
                    tramaParseada['clino3'] = this._parseClinometro(tramaParseada['medidaC'],3);

                    tramaParseada['tempExt'] = this._calcTempC(trama.substr(27,4));     //Temperatura exterior
                    //tramaParseada[8] = this._toInt(trama.substr(31,4));     //AN5
                    //tramaParseada[9] = this._toInt(trama.substr(35,4));     //AN6
                    //tramaParseada[10] = this._toInt(trama.substr(39,4));    //AN7
                    //tramaParseada[11] = this._toInt(trama.substr(43,4));    //AN8
                    tramaParseada['tempInt'] = this._toInt(trama.substr(56,2));                 //temperatura interior
                    tramaParseada['bat'] = this._toInt(trama.substr(58,4));     //bat
                    tramaParseada['time'] = this._toInt(trama.substr(0,8));       //fecha en timestamp

                    break;
                case '0501':
                    tramaParseada['tramaRaw'] = trama;
                    tramaParseada['fecha'] = this._hexToDate(trama.substr(0, 8)); //fecha
                    tramaParseada['pid'] = trama.substr(12, 1); //PID
                    tramaParseada['cod'] = trama.substr(13, 2); //COD
                    tramaParseada['medidaA'] = this._toInt(trama.substr(15,4));
                    tramaParseada['bat'] = trama.substr(69, 4); //bat
                    tramaParseada['humidity'] = (trama.substr(62,4)/10);     //humedad
                    tramaParseada['tempInt'] = (trama.substr(66,4))/10;     //temp
                    tramaParseada['time'] = this._toInt(trama.substr(0,8));       //fecha en timestamp

                    break;


            }







        return tramaParseada;


    }

}

module.exports = TcpServer;

