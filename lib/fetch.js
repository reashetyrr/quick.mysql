// Require Packages
const get = require('lodash/get');
const query_db = require('dbutils').query_database;

module.exports = async function(connection, params, options) {
    // Fetch Entry
    let fetched = await query_db(connection, `SELECT * FROM ${options.table} WHERE ID = (?)`, [params.id]);
    if (!fetched) return null; // If empty, return null
    fetched = JSON.parse(fetched.json);
    try {
        fetched = JSON.parse(fetched)
    } catch (e) {}

    // Check if target was supplied
    if (params.ops.target)
        fetched = get(fetched, params.ops.target); // Get prop using dot notation

    // Return data
    return fetched;
};