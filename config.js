/**
 * Created by albertobarquin on 28/11/16.
 */
module.exports = {
    port : process.env.REST_PORT || 3000,
    tcpPort: process.env.TCP_PORT || 3001,
    db : process.env.DB || 'mongodb://localhost:27017/cloudsystratec'
}
