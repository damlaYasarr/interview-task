// migrate-mongo-config.js
module.exports = {
  mongodb: {
    url: 'mongodb+srv://damlayasar40:eeUucaaomlKuaHXu@cluster0.ukb8dmk.mongodb.net/',
    databaseName: 'testconnect',

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
    },
  },

  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog', // The collection name in MongoDB to store the applied changes
  migrationFileExtension: '.js', // The file extension for the migrations. In our case, we're using JavaScript.
};
