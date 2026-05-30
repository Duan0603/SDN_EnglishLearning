import mongoose from 'mongoose';

const mongoURI = 'mongodb://localhost:27017/ielts_app?replicaSet=rs0&directConnection=true';

async function fixIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const keyTokenCollectionExists = collections.some(col => col.name === 'KeyToken');

    if (keyTokenCollectionExists) {
      const collection = db.collection('KeyToken');
      console.log('Fetching indexes for KeyToken...');
      const indexes = await collection.indexes();
      console.log('Current indexes:', indexes);

      const hasUserIdIndex = indexes.some(idx => idx.name === 'KeyToken_userId_key');
      if (hasUserIdIndex) {
        console.log('Dropping unique index KeyToken_userId_key...');
        await collection.dropIndex('KeyToken_userId_key');
        console.log('Index KeyToken_userId_key dropped successfully!');
      } else {
        console.log('Index KeyToken_userId_key does not exist.');
      }

      // Xóa tất cả các bản ghi lỗi có userId: null hoặc không hợp lệ để làm sạch dữ liệu
      console.log('Cleaning up invalid tokens...');
      const deleteResult = await collection.deleteMany({ userId: { $exists: false } });
      console.log(`Deleted ${deleteResult.deletedCount} invalid keytoken records.`);
    } else {
      console.log('Collection KeyToken does not exist.');
    }

  } catch (error) {
    console.error('Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

fixIndex();
