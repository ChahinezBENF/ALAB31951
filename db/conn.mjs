// db/conn.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

try {
  await mongoose.connect(process.env.ATLAS_URI, {
    dbName: 'sample_training',
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB via Mongoose');
} catch (error) {
  console.error('MongoDB connection error:', error);
}

export default mongoose;
