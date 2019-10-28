const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

exports.mongoConnect = callback => {
  MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      callback(client);
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

exports.getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'No database found!';
}
