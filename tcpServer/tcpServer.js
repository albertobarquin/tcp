'use strict';

// Load the TCP Library
const net = require('net');
const crc = require('crc');
const UTCClock = require('utc-clock');


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
                    //console.log(data_str);
                    console.log(this._parse(dataPart[1]).join(', '));
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
        const sampleTime = 1 //tiempo entre muestras en minutos
        const syncCount = 2 //número de muestras que acumula antes de enviar
        var clock = new UTCClock();
        var now  =parseInt(clock.now.ms()/1000).toString(16).toUpperCase();//timestamp UTC en milisegundos pasado a segundos redondeado, en hexadecimal y con mayúsculas
        var sample_time_hex_segundos = (sampleTime*60).toString(16).toUpperCase();
        var confMassage = "PCK_CON";
        confMassage += this._lpad(now,8,0);
        confMassage +=this._lpad(sample_time_hex_segundos,4,0);
        confMassage += this._lpad(syncCount.toString(16).toUpperCase(),4 ,0);
        confMassage += this._lpad(crc.crc8(confMassage).toString(16).toUpperCase(),2,0);
        console.log(confMassage)
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
    _hexToDate(hexMs) {return this._toDate(this._toInt(hexMs));}

    _parse (trama){
        const tramaParseada = [];

            tramaParseada[0] = this._hexToDate (trama.substr(0,8));       //fecha
            tramaParseada[1] = trama.substr(8,4);       //ID
            tramaParseada[2] = trama.substr(12,1);      //PID
            tramaParseada[3] = trama.substr(13,2);      //COD
            tramaParseada[4] = this._toInt(trama.substr(15,4));     //AN1
            tramaParseada[5] = this._toInt(trama.substr(19,4));     //AN2
            tramaParseada[6] = this._toInt(trama.substr(23,4));     //AN3
            tramaParseada[7] = this._toInt(trama.substr(27,4));     //AN4
            tramaParseada[8] = this._toInt(trama.substr(31,4));     //AN5
            tramaParseada[9] = this._toInt(trama.substr(35,4));     //AN6
            tramaParseada[10] = this._toInt(trama.substr(39,4));    //AN7
            tramaParseada[11] = this._toInt(trama.substr(43,4));    //AN8
            tramaParseada[12] = trama.substr(47,12);   //SD
            tramaParseada[13] = trama.substr(60,4);     //PUL 1
            tramaParseada[14] = trama.substr(64,4);     //PUL 2
            tramaParseada[15] = trama.substr(68,2);     //SENS TEMP
            tramaParseada[16] = trama.substr(70,4);     //BAT
            tramaParseada[17] = trama.substr(74,4)     //HUMD
            tramaParseada[18] = trama.substr(78,4);    //TEMP
            tramaParseada[19] = this._toInt(trama.substr(0,8));       //fecha



        return tramaParseada;


    }

}

module.exports = TcpServer;

