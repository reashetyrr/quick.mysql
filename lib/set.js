const set = require('lodash/set');
const query_db = require('dbutils').query_database;

module.exports = async function(connection, params, options) {
    // Fetch entry
    let fetched = await query_db(connection, `SELECT * FROM ${options.table} WHERE ID = (?)`, [params.id]);

    // If not found, create empty row
    if (!fetched) {
        await query_db(connection, `INSERT INTO ${options.table} (ID,json) VALUES (?,?)`, [params.id, '{}']);
        fetched = await query_db(connection, `SELECT * FROM ${options.table} WHERE ID = (?)`, [params.id]);
    }

    // Parse fetched
    fetched = JSON.parse(fetched.json);
    try { fetched = JSON.parse(fetched) } catch (e) {}

    // Check if a target was supplied
    if (typeof fetched === 'object' && params.ops.target) {
        params.data = JSON.parse(params.data);
        params.data = set(fetched, params.ops.target, params.data);
    } else if (params.ops.target) throw new TypeError('Cannot target a non-object.');

    // Stringify data
    params.data = JSON.stringify(params.data);

    // Update entry with new data
    await query_db(connection, `UPDATE ${options.table} SET json = (?) WHERE ID = (?)`, [params.data, params.id]);

    // Fetch & return new data
    let newData = await query_db(connection, `SELECT * FROM ${options.table} WHERE ID = (?)`, [params.id]).json;
    if (newData === '{}') return null;
    else {
        newData = JSON.parse(newData);
        try { newData = JSON.parse(newData) } catch (e) {}
        return newData
    }
};