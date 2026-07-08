const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ielts_app?directConnection=true')
  .then(async () => {
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    const user = await collection.findOne({ email: 'tnt11925@gmail.com' });
    console.log(JSON.stringify(user, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
