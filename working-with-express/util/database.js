const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = callback => {
  MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
    .then(client => {
      console.log('Connected!');
      callback(client);
    })
    .catch(err => console.log(err));
};

module.exports = mongoConnect;
