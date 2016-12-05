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
        console.log('tcpServer.js ->33')
        console.log(message.replace(/\n+$/, ""));
    }

    /*
     * Starting the server
     * The callback is executed when the server finally inits
     */
    start (callback) {

        var server = this;
        const regex = /END/;
        const regexData =/PCK_DAT([0-9A-Fa-f-+-.]*)PCK_FIN/;


        this.connection = net.createServer((socket) => {

            socket.setTimeout(global.abk_config.tcpTimeOut);

            var client = new Client(socket);


            if (!server._validateClient(client)) {
                client.socket.destroy();
                return;
            }

            // Broadcast the new connection
           // console.log(`${client.name} connected.\n`, client);
             console.log(`${client.name} connected.\n`);


            // Storing client for later usage
            server.clients.push(client);

            //socket events

            // Triggered on message received by this client
            socket.on('data', (data) => {

                // Broadcasting the message
                server.broadcast(`${client.name} says: ${data}`, client);

                let data_str = data.toString();

                let data_prefix = data_str.substr(0,11);

                //tenemos que comprobar:
                // la longitud de la cadena de datos
                // Si si hay que mandar el config o no
                // si vienen datos
                // si es la última trama
                // si vienen todas las tramas



                

                /*switch (data_prefix){
                    case 'PCK_IDE':
                        //
                    break;




                }*/



                if (data_str.substr(0,11) == "PCK_IDE0500"){
                    this._sendConfig(client);
                    console.log ("Config sent")
                }
                let dataPart = regexData.exec(data_str);
                if (dataPart != null && dataPart[1]){
                    console.log('existe el grupo 1');
                    console.log(dataPart[1])

                }
                if (regex.exec(data_str)){
                    console.log('END encontrado')
                    client.receiveMessage('ADIOS');
                }

            });

            // Triggered when this client disconnects
            socket.on('end', () => {
                // Removing the client from the list
                server.clients.splice(server.clients.indexOf(client), 1);
                // Broadcasting that this player left
                server.broadcast(`${client.name} disconnected.\n`);
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

    /*
     * An example function: Validating the client
     */
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



}

module.exports = TcpServer;

