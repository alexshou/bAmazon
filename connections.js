const Promises = require('bluebird');
const MySQL = require('mysql');

Promises.promisifyAll(require("mysql/lib/Connection").prototype);
Promises.promisifyAll(require("mysql/lib/Pool").prototype);

let amazonConnection = MySQL.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
});

let allConnections = {
	'bamazon' : amazonConnection
};

module.exports = allConnections;