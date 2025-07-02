import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server.js'; // Assuming server.js exports the app
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

// Test Database connection string (replace with your actual test DB connection)
// For local testing, you might use MongoDB Memory Server or a separate test DB
const MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/test_db_salary_api";

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
    email: 'coordinator@example.com',
    password: hashedPassword,
    mobileNumber: '1234567890',
    role: 'coordinator',
    base_salary: 1500,
    penalties: 50,
    isVerified: true,
    isApproved: true,
  }).save();
  // Create wallet for coordinator (though not directly used for salary calc, good for consistency)
  await new Wallet({ user: coordinatorUser._id, balance: 0 }).save();


  studentUser = await new User({
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Student',
    lastName: 'User',
    email: 'student@example.com',
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
    email: 'coordstudent1@example.com',
    password: hashedPassword,
    mobileNumber: '1112223333',
    role: 'student',
    coordinator: coordinatorUser._id,
    isVerified: true,
    isApproved: true,
  }).save();
  const studentOfCoordinatorWallet = await new Wallet({ user: studentOfCoordinator._id, balance: 0 }).save();

  // Add topups for studentOfCoordinator
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  studentOfCoordinatorWallet.history.push(
    { oldBalance: 0, newBalance: 200, changedBy: coordinatorUser._id, reason: "topup", createdAt: firstDayOfMonth }, // 200
    { oldBalance: 200, newBalance: 300, changedBy: coordinatorUser._id, reason: "topup", createdAt: new Date(now.getFullYear(), now.getMonth(), 15) } // 100
  );
  studentOfCoordinatorWallet.balance = 300;
  await studentOfCoordinatorWallet.save();


  coordinatorToken = jwt.sign({ id: coordinatorUser._id, role: coordinatorUser.role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
  studentToken = jwt.sign({ id: studentUser._id, role: studentUser.role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  // In case some tests modify data that should be reset or specific to a test
  // For now, major seeding is in beforeAll
});


describe('GET /api/salary/me', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/salary/me');
    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 if token is for a non-coordinator user (e.g., student)', async () => {
    const res = await request(app)
      .get('/api/salary/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body.error).toContain('insufficient role');
  });

  it('should return salary details for the logged-in coordinator', async () => {
    const res = await request(app)
      .get('/api/salary/me')
      .set('Authorization', `Bearer ${coordinatorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('base_salary', 1500);
    expect(res.body).toHaveProperty('penalties', 50);

    const expectedTopupsTotal = 200 + 100; // From studentOfCoordinator
    expect(res.body).toHaveProperty('topups_total', expectedTopupsTotal);

    const expectedMonthlySalary = 1500 + (expectedTopupsTotal * 0.05) - 50; // 1500 + 15 - 50 = 1465
    expect(res.body).toHaveProperty('monthly_salary', expectedMonthlySalary);
  });

  it('should handle coordinator with 0 base_salary and 0 penalties correctly', async () => {
    // Create a new coordinator for this specific test
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const zeroSalaryCoord = await new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: 'Zero', lastName: 'Salary', email: 'zeros@example.com', password: hashedPassword,
        mobileNumber: '4445556666', role: 'coordinator', base_salary: 0, penalties: 0, isVerified: true, isApproved: true,
    }).save();
    await new Wallet({ user: zeroSalaryCoord._id }).save();
    const zeroSalaryToken = jwt.sign({ id: zeroSalaryCoord._id, role: zeroSalaryCoord.role }, process.env.JWT_SECRET || 'testsecret');

    const res = await request(app)
      .get('/api/salary/me')
      .set('Authorization', `Bearer ${zeroSalaryToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.base_salary).toBe(0);
    expect(res.body.penalties).toBe(0);
    expect(res.body.topups_total).toBe(0); // This coordinator has no students with topups
    expect(res.body.monthly_salary).toBe(0);

    await User.deleteOne({_id: zeroSalaryCoord._id}); // Clean up
    await Wallet.deleteOne({user: zeroSalaryCoord._id});
  });

  it('should handle coordinator with no students (resulting in 0 topups_total)', async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const noStudentCoord = await new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: 'NoStudent', lastName: 'Coord', email: 'nostudent@example.com', password: hashedPassword,
        mobileNumber: '7778889999', role: 'coordinator', base_salary: 1000, penalties: 20, isVerified: true, isApproved: true,
    }).save();
    await new Wallet({ user: noStudentCoord._id }).save();
    const noStudentToken = jwt.sign({ id: noStudentCoord._id, role: noStudentCoord.role }, process.env.JWT_SECRET || 'testsecret');

    const res = await request(app)
      .get('/api/salary/me')
      .set('Authorization', `Bearer ${noStudentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.base_salary).toBe(1000);
    expect(res.body.penalties).toBe(20);
    expect(res.body.topups_total).toBe(0);
    expect(res.body.monthly_salary).toBe(1000 - 20); // 980

    await User.deleteOne({_id: noStudentCoord._id}); // Clean up
    await Wallet.deleteOne({user: noStudentCoord._id});
  });
});
