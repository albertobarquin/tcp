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


        this.connection = net.createServer((socket) => {

            var client = new Client(socket);
            if (!server._validateClient(client)) {
                client.socket.destroy();
                return;
            }
            // Broadcast the new connection
            console.log(`${client.name} connected.\n`, client);


            // Storing client for later usage
            server.clients.push(client);

            // Triggered on message received by this client
            socket.on('data', (data) => {
                // Broadcasting the message
                server.broadcast(`${client.name} says: ${data}`, client);
                var data_str = data.toString()
                if (data_str.substr(0,11) == "PCK_IDE0800"){
                    this._sendConfig(client);
                    console.log ("Config sent")
                }

            });

            // Triggered when this client disconnects
            socket.on('end', () => {
                // Removing the client from the list
                server.clients.splice(server.clients.indexOf(client), 1);
                // Broadcasting that this player left
                server.broadcast(`${client.name} disconnected.\n`);
            });

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
    /*            def send_CONF(self):
     global tiempo_config
     comienzo = time.time()
     sample_time = 1  # 15 minutes
     sync_count = 2  # 4 samples per hour
     now = datetime.utcnow()
     cfg_message = "PCK_CON"
     data_message = "%08X" % int(now.strftime('%s'))
     data_message += "%04X" % int(sample_time * 60)  # convert to seconds
     data_message += "%04X" % sync_count
     data_message += "%02X" % calculateCRC(data_message)
     # data_message+="00"
     cfg_message += data_message
     self.request.sendall(cfg_message)
     print ('enviado el config', cfg_message)
     self.message += "CFG:SENT (%d-%d) " % (sample_time, sync_count)
     self.data = ''
     fin = time.time() - comienzo
     tiempo_config += fin*/


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

