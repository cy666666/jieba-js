/**
 * 使用方法：http://docs.sequelizejs.com/en/v3/docs/models-usage/
 * 欄位類型定義：http://docs.sequelizejs.com/en/v3/docs/models-definition/
 */
var Sequelize = require('sequelize');

// ----------------

var sequelize = new Sequelize('jiebaserver', 'jiebaserver', 'password', {
    // SQLite
    dialect: 'sqlite',
    storage: 'database.sqlite',

    // PostgreSQL
    //dialect: "postgres",
    //host: CONFIG.database.host,
    

    logging: false
});

// --------------------------------

tableArticleCache = sequelize.define('articlecache', {
  article: {
    type: Sequelize.TEXT
  },
  result: {
    type: Sequelize.TEXT
  }
}, {
  freezeTableName: true, // Model tableName will be the same as the model name
  timestamps: true
});

tableArticleCache.sync();