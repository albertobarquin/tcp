'use strict';


class tcpClient {

    constructor (socket) {
        this.address = socket.remoteAddress;
        this.port 	 = socket.remotePort;
        this.name    = `${this.address}:${this.port}`;
        this.socket  = socket;
        this.id      = "";
        this.loginAtemps = 0;
    }

    receiveMessage (message) {
        this.socket.write(message);
    }

}
module.exports = tcpClient;
