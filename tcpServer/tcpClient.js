'use strict';


class tcpClient {

    constructor (socket) {
        this.address = socket.remoteAddress;
        this.port 	 = socket.remotePort;
        this.name    = `${this.address}:${this.port}`;
        this.socket  = socket;
        this.id      = "";
        this.loginAtemps = 0;
        console.log('\n\nNUEVA CONEXION: '+this.name+'\n\n');
    }

    receiveMessage (message, callback = function(){return true}) {
        this.socket.write(message, callback);
    }

}
module.exports = tcpClient;
