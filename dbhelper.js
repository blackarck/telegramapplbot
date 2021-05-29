const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const getconnection = () => {

    connection = mysql.createConnection({
        host: process.env.localdbhost,
        user: process.env.localdbuserid,
        password: process.env.localdbpwd,
        database: process.env.dbname,
    });

    connection.connect(function(err) {
        if (err) {
            //console.error('error connecting: ' + err.stack);
            return console.log("Error connecting to database ");
        } else {
            console.log("Connected to database");
        }
    });
    return connection;
};

var newConnection = () => {
    pool = mysql.createPool({
        connectionLimit: 50,
        host: process.env.localdbhost,
        user: process.env.localdbuserid,
        password: process.env.localdbpwd,
        database: process.env.dbname,
        connectTimeout: 20000,
        acquireTimeout: 20000,
        timeout: 90000,
    });
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log("DB error " + err);
            if (connection)
                connection.release();
            throw err;
        } else {
            console.log("Connection with DB success");
        }
    });
    return pool;
}
module.exports.getconnection = newConnection;