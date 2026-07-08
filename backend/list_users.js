const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ielts_app?directConnection=true')
  .then(async () => {
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    const users = await collection.find({}).toArray();
    console.log(users.map(u => ({ email: u.email, name: u.fullName })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
