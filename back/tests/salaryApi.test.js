import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/test_db_salary_api_v2";

let coordinatorToken, studentToken;
let coordinatorUser, studentUser;
let studentOfCoordinator;

const setupTestDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI_TEST);
  } catch (err) {
    console.error("Test DB connection error:", err);
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

  coordinatorUser = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Coord',
    lastName: 'User',
    email: 'coordinator_v2@example.com',
    password: hashedPassword,
    mobileNumber: '1234567890',
    role: 'coordinator',
    base_salary: 1500,
    penalties: 10, // Now represents 10%
    isVerified: true,
    isApproved: true,
  }).save();
  await new Wallet({ user: coordinatorUser._id, balance: 0 }).save();


  studentUser = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Student',
    lastName: 'User',
    email: 'student_v2@example.com',
    password: hashedPassword,
    mobileNumber: '0987654321',
    role: 'student',
    isVerified: true,
    isApproved: true,
  }).save();
   await new Wallet({ user: studentUser._id, balance: 0 }).save();

  studentOfCoordinator = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'CoordStudent',
    lastName: 'One',
    email: 'coordstudent1_v2@example.com',
    password: hashedPassword,
    mobileNumber: '1112223333',
    role: 'student',
    coordinator: coordinatorUser._id,
    isVerified: true,
    isApproved: true,
  }).save();
  const studentOfCoordinatorWallet = await new Wallet({ user: studentOfCoordinator._id, balance: 0 }).save();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  studentOfCoordinatorWallet.history.push(
    { oldBalance: 0, newBalance: 200, changedBy: coordinatorUser._id, reason: "topup", createdAt: firstDayOfMonth }, // 200
    { oldBalance: 200, newBalance: 300, changedBy: coordinatorUser._id, reason: "topup", createdAt: new Date(now.getFullYear(), now.getMonth(), 15) } // 100
  );
  studentOfCoordinatorWallet.balance = 300;
  await studentOfCoordinatorWallet.save();

  coordinatorToken = jwt.sign({ id: coordinatorUser._id, role: coordinatorUser.role }, process.env.JWT_SECRET || 'testsecret_v2', { expiresIn: '1h' });
  studentToken = jwt.sign({ id: studentUser._id, role: studentUser.role }, process.env.JWT_SECRET || 'testsecret_v2', { expiresIn: '1h' });
});

afterAll(async () => {
  await teardownTestDB();
});


describe('GET /api/salary/me (penalties as percentage)', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/salary/me');
    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 if token is for a non-coordinator user', async () => {
    const res = await request(app)
      .get('/api/salary/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toEqual(403);
  });

  it('should return salary details with percentage penalty calculations', async () => {
    const res = await request(app)
      .get('/api/salary/me')
      .set('Authorization', `Bearer ${coordinatorToken}`);

    expect(res.statusCode).toEqual(200);

    const baseSalary = 1500;
    const penaltyPercentage = 10;
    const topupsTotal = 200 + 100; // 300
    const bonus = topupsTotal * 0.05; // 15
    const grossSalaryBeforePenalty = baseSalary + bonus; // 1500 + 15 = 1515
    const penaltyAmountDeducted = grossSalaryBeforePenalty * (penaltyPercentage / 100); // 1515 * 0.10 = 151.5
    const expectedMonthlySalary = grossSalaryBeforePenalty - penaltyAmountDeducted; // 1515 - 151.5 = 1363.5

    expect(res.body).toHaveProperty('base_salary', baseSalary);
    expect(res.body).toHaveProperty('penalties_percentage', penaltyPercentage);
    expect(res.body).toHaveProperty('topups_total', topupsTotal);
    expect(res.body).toHaveProperty('gross_salary_before_penalty', grossSalaryBeforePenalty);
    expect(res.body).toHaveProperty('penalty_amount_deducted', penaltyAmountDeducted);
    expect(res.body).toHaveProperty('monthly_salary', expectedMonthlySalary);
  });

  it('should handle coordinator with 0 base_salary and 0 penalties_percentage', async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const zeroSalaryCoord = await new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: 'ZeroV2', lastName: 'Salary', email: 'zeros_v2@example.com', password: hashedPassword,
        mobileNumber: '4445556666', role: 'coordinator', base_salary: 0, penalties: 0, isVerified: true, isApproved: true,
    }).save();
    await new Wallet({ user: zeroSalaryCoord._id }).save();
    const zeroSalaryToken = jwt.sign({ id: zeroSalaryCoord._id, role: zeroSalaryCoord.role }, process.env.JWT_SECRET || 'testsecret_v2');

    const res = await request(app)
      .get('/api/salary/me')
      .set('Authorization', `Bearer ${zeroSalaryToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.base_salary).toBe(0);
    expect(res.body.penalties_percentage).toBe(0);
    expect(res.body.topups_total).toBe(0);
    expect(res.body.gross_salary_before_penalty).toBe(0);
    expect(res.body.penalty_amount_deducted).toBe(0);
    expect(res.body.monthly_salary).toBe(0);

    await User.deleteOne({_id: zeroSalaryCoord._id});
    await Wallet.deleteOne({user: zeroSalaryCoord._id});
  });
});
