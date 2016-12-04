'use strict';


class tcpClient {

    constructor (socket) {
        this.address = socket.remoteAddress;
        this.port 	 = socket.remotePort;
        this.name    = `${this.address}:${this.port}`;
        this.socket  = socket;
        this.id      = "";
    }

    receiveMessage (message) {
        this.socket.write(message);
    }

}
module.exports = tcpClient;
