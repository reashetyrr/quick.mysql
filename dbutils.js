module.exports = {
    query_database: query_db
};

async function query_db(connection, query, params) {
    return new Promise((resolve, reject) => {
       connection.query(query, params, (err, results) => {
          if (err)
              return reject(err);
          return resolve(results);
       });
    });
}