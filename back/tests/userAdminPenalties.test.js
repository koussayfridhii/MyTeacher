import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js'; // Though not directly used, good for consistency if users have wallets

const MONGODB_URI_TEST_ADMIN = process.env.MONGODB_URI_TEST_ADMIN || "mongodb://localhost:27017/test_db_admin_penalties";

let adminToken;
let adminUser, targetCoordinator, targetStudent;

const setupTestDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI_TEST_ADMIN);
  } catch (err) {
    console.error("Test DB Admin connection error:", err);
    process.exit(1);
  }
};

const clearTestDB = async () => {
  await User.deleteMany({});
  await Wallet.deleteMany({});
};

const teardownTestDB = async () => {
  await clearTestDB();
  await mongoose.connection.close();
};

beforeAll(async () => {
  await setupTestDB();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  adminUser = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Admin', lastName: 'User', email: 'admin_pen@example.com', password: hashedPassword,
    mobileNumber: '1234509876', role: 'admin', isVerified: true, isApproved: true,
  }).save();
  await new Wallet({ user: adminUser._id }).save();

  targetCoordinator = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Target', lastName: 'Coord', email: 'targetcoord@example.com', password: hashedPassword,
    mobileNumber: '1122334455', role: 'coordinator', base_salary: 1000, penalties: 20, isVerified: true, isApproved: true,
  }).save();
  await new Wallet({ user: targetCoordinator._id }).save();

  targetStudent = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Target', lastName: 'Student', email: 'targetstudent@example.com', password: hashedPassword,
    mobileNumber: '2233445566', role: 'student', penalties: 0, isVerified: true, isApproved: true, // penalties should be 0 for student
  }).save();
  await new Wallet({ user: targetStudent._id }).save();

  adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET || 'testsecret_admin', { expiresIn: '1h' });
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
    // Reset coordinator's penalties to a known state before certain tests if needed
    await User.findByIdAndUpdate(targetCoordinator._id, { penalties: 20 });
    await User.findByIdAndUpdate(targetStudent._id, { penalties: 0 }); // Ensure student penalties is 0
});

describe('PATCH /api/users/:id (Admin updating penalties)', () => {
  it('Admin should be able to update penalties for a coordinator', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: 100 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('penalties', 100);
    const updatedUser = await User.findById(targetCoordinator._id);
    expect(updatedUser.penalties).toBe(100);
  });

  it('Admin should be able to set penalties to 0 for a coordinator', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: 0 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('penalties', 0);
     const updatedUser = await User.findById(targetCoordinator._id);
    expect(updatedUser.penalties).toBe(0);
  });

  it('Admin providing null or empty string for penalties should set it to 0 for coordinator', async () => {
    let res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: null });
    expect(res.statusCode).toEqual(200);
    expect(res.body.user.penalties).toBe(0);

    res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: "" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.user.penalties).toBe(0);
  });

  it('Admin should get a 400 if attempting to set negative penalties for a coordinator', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: -50 });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('Invalid value for penalties');
  });

  it('Admin updating penalties for a non-coordinator (e.g., student) should result in penalties being 0', async () => {
    await User.findByIdAndUpdate(targetStudent._id, { penalties: 5 }); // Forcefully set for testing

    const res = await request(app)
      .patch(`/api/users/${targetStudent._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: 100 }); // Attempt to set penalties

    expect(res.statusCode).toEqual(200);
    // The controller logic should force penalties to 0 for non-coordinators
    expect(res.body.user).toHaveProperty('penalties', 0);
    const updatedStudent = await User.findById(targetStudent._id);
    expect(updatedStudent.penalties).toBe(0);
  });

  it('When admin changes role from coordinator to student, penalties should become 0', async () => {
    await User.findByIdAndUpdate(targetCoordinator._id, { penalties: 150 });
    const res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'student' }); // Not sending penalties, it should be reset due to role change

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.role).toBe('student');
    expect(res.body.user.penalties).toBe(0);
    const updatedUser = await User.findById(targetCoordinator._id);
    expect(updatedUser.penalties).toBe(0);

    // Change role back for other tests
    await User.findByIdAndUpdate(targetCoordinator._id, { role: 'coordinator', penalties: 20 });
  });

  it('If penalties field is not sent for a non-coordinator, it should remain 0 or be set to 0', async () => {
    // Setup: ensure student has 0 penalties
    await User.findByIdAndUpdate(targetStudent._id, { penalties: 0 });

    const res = await request(app)
      .patch(`/api/users/${targetStudent._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: "UpdatedStudentName" }); // Update another field, not penalties

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.firstName).toBe("UpdatedStudentName");
    expect(res.body.user.penalties).toBe(0);

    const updatedStudent = await User.findById(targetStudent._id);
    expect(updatedStudent.penalties).toBe(0);
  });
});
