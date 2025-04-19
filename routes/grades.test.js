import request from 'supertest';
import express from 'express';
import gradesRouter from './grades.mjs'; // Adjust the path if needed
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/grades', gradesRouter);


//Ensure the database connection is established and cleaned up after all tests
beforeAll(async () => {
  await mongoose.connect(process.env.ATLAS_URI, {
    dbName: 'test_db', // Use a test database
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    await mongoose.connection.collections[collectionName].deleteMany({});
  }
  await mongoose.connection.close();
});


describe('Grades API', () => {
  let testGradeId;

  it('should create a new grade entry', async () => {
    const response = await request(app)
      .post('/grades')
      .send({
        learner_id: 123,
        class_id: 456,
        scores: [
          { type: 'exam', score: 95 },
          { type: 'quiz', score: 85 },
        ],
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.learner_id).toBe(123);
    testGradeId = response.body._id;
  });

  it('should get the created grade entry', async () => {
    const response = await request(app).get(`/grades/${testGradeId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id', testGradeId);
    expect(response.body.scores).toHaveLength(2);
  });

  it('should add a score to the grade entry', async () => {
    const response = await request(app)
      .patch(`/grades/${testGradeId}/add`)
      .send({ type: 'homework', score: 80 });
    expect(response.status).toBe(200);
    expect(response.body.scores).toHaveLength(3);
  });

  it('should delete the grade entry', async () => {
    const response = await request(app).delete(`/grades/${testGradeId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Grade deleted successfully');
  });

  it('should return 404 for a non-existing grade', async () => {
    const response = await request(app).get(`/grades/${testGradeId}`);
    expect(response.status).toBe(404);
  });
});
