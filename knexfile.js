const credentials = require("./config/mysqlCredentials.js");

const {knexSnakeCaseMappers} = require('objection');

module.exports = {

  development: { //environment
    client: 'mysql',
    connection: {
      database: credentials.database,
      user:     credentials.user,
      password: credentials.password
    },
    ...knexSnakeCaseMappers()
  }

};
