const mysql = require('mysql');
let connection;

const methods = {
    fetch: require('lib/fetch.js'),
    set: require('lib/set.js'),
    add: require('lib/add.js'),
    subtract: require('lib/subtract.js'),
    push: require('lib/push.js'),
    delete: require('lib/delete.js'),
    has: require('lib/has.js'),
    all: require('lib/all.js'),
    type: require('lib/type')
};

function init_connection(config) {
    connection = mysql.createConnection({
        host: config.host,
        user: config.username,
        pass: config.password
    });

    connection.connect(err => {
        if (err) throw err;
        connection.query(`CREATE DATABASE IF NOT EXISTS quick_mysql;`, (err, results) => {
            if (err) throw err;
            connection.query('USE DATABASE quick_mysql', (err, results) => {
                if (err) throw err;
            });
        });
    });
}

function arbitrade (method, params, tableName) {
    let options = {
        table: tableName || 'json'
    };

    connection.query(`CREATE TABLE IF NOT EXISTS ${options.table} (ID TEXT, json TEXT)`, (err, results) => {
        if (err) throw err;
    });

    if (params.ops.target && params.ops.target[0] === '.') params.ops.target = params.ops.target.slice(1); // Remove prefix if necessary
    if (params.data && params.data === Infinity) throw new TypeError(`You cannot set Infinity into the database @ ID: ${params.id}`)

    if (params.stringify) {
        try { params.data = JSON.stringify(params.data); } catch (e)
        { throw new TypeError(`Please supply a valid input @ ID: ${params.id}\nError: ${e.message}`); }
    }

    if (params.id && params.id.includes('.')) {
        let unparsed = params.id.split('.');
        params.id = unparsed.shift();
        params.ops.target = unparsed.join('.');
    }

    // Run & Return Method
    return methods[method](connection, params, options);
}

module.exports = {
    version: '1.0.0',
    init: init_connection,
    fetch: (key, ops) => {
        if (!key) throw new TypeError('No key specified. Need Help? Check Out: discord.gg/plexidev');
        return arbitrate('fetch', {id: key, ops: ops || {}});
    }
};
