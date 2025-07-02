import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

const MONGODB_URI_TEST_ADMIN = process.env.MONGODB_URI_TEST_ADMIN_V2 || "mongodb://localhost:27017/test_db_admin_penalties_v2";

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
    firstName: 'AdminV2', lastName: 'User', email: 'admin_pen_v2@example.com', password: hashedPassword,
    mobileNumber: '1234509876', role: 'admin', isVerified: true, isApproved: true,
  }).save();
  await new Wallet({ user: adminUser._id }).save();

  targetCoordinator = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'TargetV2', lastName: 'Coord', email: 'targetcoord_v2@example.com', password: hashedPassword,
    mobileNumber: '1122334455', role: 'coordinator', base_salary: 1000, penalties: 5, // 5% penalty
    isVerified: true, isApproved: true,
  }).save();
  await new Wallet({ user: targetCoordinator._id }).save();

  targetStudent = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'TargetV2', lastName: 'Student', email: 'targetstudent_v2@example.com', password: hashedPassword,
    mobileNumber: '2233445566', role: 'student', penalties: 0, isVerified: true, isApproved: true,
  }).save();
  await new Wallet({ user: targetStudent._id }).save();

  adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET || 'testsecret_admin_v2', { expiresIn: '1h' });
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
    await User.findByIdAndUpdate(targetCoordinator._id, { penalties: 5 }); // Reset to 5%
    await User.findByIdAndUpdate(targetStudent._id, { penalties: 0 });
});

describe('PATCH /api/users/:id (Admin updating penalties as percentage)', () => {
  it('Admin should be able to update penalties (percentage) for a coordinator', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: 15 }); // Update to 15%

    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('penalties', 15);
    const updatedUser = await User.findById(targetCoordinator._id);
    expect(updatedUser.penalties).toBe(15);
  });

  it('Admin should be able to set penalties (percentage) to 0 for a coordinator', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: 0 }); // Update to 0%

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

  it('Admin should get a 400 if attempting to set negative penalties (percentage) for a coordinator', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: -5 }); // -5%

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('Invalid value for penalties');
  });

  // Optional: Test for upper bound if one were implemented (e.g. > 100)
  // it('Admin should get a 400 if attempting to set penalties over 100%', async () => {
  //   const res = await request(app)
  //     .patch(`/api/users/${targetCoordinator._id}`)
  //     .set('Authorization', `Bearer ${adminToken}`)
  //     .send({ penalties: 101 });
  //   expect(res.statusCode).toEqual(400);
  //   expect(res.body.error).toContain('must be a number between 0 and 100');
  // });

  it('Admin updating penalties for a non-coordinator should result in penalties being 0', async () => {
    await User.findByIdAndUpdate(targetStudent._id, { penalties: 5 }); // Forcefully set for testing

    const res = await request(app)
      .patch(`/api/users/${targetStudent._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ penalties: 10 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('penalties', 0);
    const updatedStudent = await User.findById(targetStudent._id);
    expect(updatedStudent.penalties).toBe(0);
  });

  it('When admin changes role from coordinator to student, penalties (percentage) should become 0', async () => {
    await User.findByIdAndUpdate(targetCoordinator._id, { penalties: 25 }); // 25%
    const res = await request(app)
      .patch(`/api/users/${targetCoordinator._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'student' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.role).toBe('student');
    expect(res.body.user.penalties).toBe(0);
    const updatedUser = await User.findById(targetCoordinator._id);
    expect(updatedUser.penalties).toBe(0);

    await User.findByIdAndUpdate(targetCoordinator._id, { role: 'coordinator', penalties: 5 }); // Change back
  });
});
