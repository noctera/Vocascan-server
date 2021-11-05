/**
 * For more help with the file see https://docs.vocascan.com/#/vocascan-server/configuration
 * This config file lists all available options
 */

module.exports = {
  debug: false,

  server: {
    port: 8000,
    jwt_secret: '',
    salt_rounds: 10,
  },

  database: {
    dialect: 'postgres',
    host: 'db',
    port: '5432',
    username: 'vocascan',
    password: 'vocascan',
    database: 'vocascan',
  },

  log: {
    console: {
      level: 'info',
      colorize: true,
      enable_sql_log: true,
      enable_router_log: true,
      stderr_levels: ['error'],
    },
  },
};
