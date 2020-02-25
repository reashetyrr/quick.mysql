const mysql = require('mysql');
let connection;

const methods = {
    fetch: require('lib/fetch.js'),
    set: require('lib/set.js'),
    // add: require('lib/add.js'),
    // subtract: require('lib/subtract.js'),
    push: require('lib/push.js'),
    // delete: require('lib/delete.js'),
    // has: require('lib/has.js'),
    // all: require('lib/all.js'),
    // type: require('lib/type')
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
        if (!key) throw new TypeError('No key specified');
        return arbitrate('fetch', {id: key, ops: ops || {}});
    },
    get: function(key, ops) {
        if (!key) throw new TypeError('No key specified');
        return arbitrate('fetch', {id: key, ops: ops || {}});
    },

    /**
     * This function sets new data based on a key in the database.
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the updated data.
     */

    set: function(key, value, ops) {
        if (!key) throw new TypeError('No key specified');
        if (value === undefined) throw new TypeError('No value specified');
        return arbitrate('set', {stringify: true, id: key, data: value, ops: ops || {}});
    },

    /**
     * This function adds a number to a key in the database. (If no existing number, it will add to 0)
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the updated data.
     */

    add: function(key, value, ops) {
        if (!key) throw new TypeError('No key specified');
        if (isNaN(value)) throw new TypeError('Must specify value to add');
        return arbitrate('add', {id: key, data: value, ops: ops || {}});
    },

    /**
     * This function subtracts a number to a key in the database. (If no existing number, it will subtract from 0)
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the updated data.
     */

    subtract: function(key, value, ops) {
        if (!key) throw new TypeError('No key specified');
        if (isNaN(value)) throw new TypeError('Must specify value to add');
        return arbitrate('subtract', {id: key, data: value, ops: ops || {}});
    },

    /**
     * This function will push into an array in the database based on the key. (If no existing array, it will create one)
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the updated data.
     */

    push: function(key, value, ops) {
        if (!key) throw new TypeError('No key specified');
        if (!value && value != 0) throw new TypeError('Must specify value to push');
        return arbitrate('push', {stringify: true, id: key, data: value, ops: ops || {}});
    },


    /**

     */

    /**
     * This function will delete an object (or property) in the database.
     * @param {key} input any string as a key. Also allows for dot notation following the key, this will delete the prop in the object.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {boolean} if it was a success or not.
     */

    delete: function(key, ops) {
        if (!key) throw new TypeError('No key specified');
        return arbitrate('delete', {id: key, ops: ops || {}});
    },

    /**
     * This function returns a boolean indicating whether an element with the specified key exists or not.
     * @param {key} input any string as a key. Also allows for dot notation following the key, this will return if the prop exists or not.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {boolean} if it exists.
     */

    has: function(key, ops) {
        if (!key) throw new TypeError('No key specified');
        return arbitrate('has', {id: key,  ops: ops || {}});
    },

    includes: function(key, ops) {
        if (!key) throw new TypeError('No key specified');
        return arbitrate('has', {id: key,  ops: ops || {}});
    },

    /**
     * This function fetches the entire active table
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {boolean} if it exists.
     */

    all: function(ops) {
        return arbitrate('all', {ops: ops || {}});
    },

    fetchAll: function(ops) {
        return arbitrate('all', {ops: ops || {}});
    },


    /* 
    * Used to get the type of the value.
    */


    type: function(key, ops) {
        if (!key) throw new TypeError('No key specified');
        return arbitrate('type', {id: key, ops: ops || {}});
    },
};
