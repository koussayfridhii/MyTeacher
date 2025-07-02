import mongoose from "mongoose";
import { calculateCoordinatorSalary } from "../controllers/userController.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

// Mock the models
jest.mock("../models/User.js");
jest.mock("../models/Wallet.js");

describe("calculateCoordinatorSalary", () => {
  let mockCoordinatorId;

  beforeEach(() => {
    // Reset mocks before each test
    User.find.mockReset();
    Wallet.find.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    mockCoordinatorId = new mongoose.Types.ObjectId().toString();
  });

  afterEach(() => {
    console.error.mockRestore(); // Restore console.error
  });

  test("should return base salary and 0 topups if coordinatorId is invalid", async () => {
    const result = await calculateCoordinatorSalary("invalidId", 1000, 50);
    expect(result.finalSalary).toBe(1000 - 50);
    expect(result.totalTopupsThisMonth).toBe(0);
    expect(console.error).toHaveBeenCalledWith("Invalid coordinatorId provided to calculateCoordinatorSalary");
  });

  test("should return base salary minus penalties if coordinator has no students", async () => {
    User.find.mockResolvedValue([]);
    const result = await calculateCoordinatorSalary(mockCoordinatorId, 1200, 100);
    expect(User.find).toHaveBeenCalledWith({ coordinator: mockCoordinatorId, role: "student" });
    expect(result.finalSalary).toBe(1100);
    expect(result.totalTopupsThisMonth).toBe(0);
  });

  test("should return base salary minus penalties if students have no wallets or empty history", async () => {
    const students = [{ _id: new mongoose.Types.ObjectId() }];
    User.find.mockResolvedValue(students);
    Wallet.find.mockResolvedValue([{ history: [] }, { history: null }]); // Students with no useful wallet history

    const result = await calculateCoordinatorSalary(mockCoordinatorId, 1200, 50);
    expect(result.finalSalary).toBe(1150); // 1200 + 0*0.05 - 50
    expect(result.totalTopupsThisMonth).toBe(0);
  });

  test("should correctly calculate salary with topups and penalties", async () => {
    const studentId1 = new mongoose.Types.ObjectId();
    const studentId2 = new mongoose.Types.ObjectId();
    User.find.mockResolvedValue([{ _id: studentId1 }, { _id: studentId2 }]);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const middleOfMonth = new Date(now.getFullYear(), now.getMonth(), 15);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

    Wallet.find.mockResolvedValue([
      { // Student 1 Wallet
        user: studentId1,
        history: [
          { reason: "topup", newBalance: 100, oldBalance: 0, createdAt: middleOfMonth }, // 100
          { reason: "topup", newBalance: 50, oldBalance: 0, createdAt: firstDayOfMonth },  // 50
          { reason: "attendClass", newBalance: 0, oldBalance: 20, createdAt: middleOfMonth },
        ],
      },
      { // Student 2 Wallet
        user: studentId2,
        history: [
          { reason: "topup", newBalance: 200, oldBalance: 100, createdAt: middleOfMonth }, // 100
          { reason: "topup", newBalance: 100, oldBalance: 0, createdAt: lastMonth }, // Not this month
          { reason: "bonus", newBalance: 10, oldBalance: 0, createdAt: middleOfMonth }, // Not a topup
        ],
      },
    ]);

    const baseSalary = 1000;
    const penalties = 50;
    const result = await calculateCoordinatorSalary(mockCoordinatorId, baseSalary, penalties);

    const expectedTopups = 100 + 50 + 100; // 250
    expect(result.totalTopupsThisMonth).toBe(expectedTopups);
    expect(result.finalSalary).toBe(baseSalary + (expectedTopups * 0.05) - penalties); // 1000 + 12.5 - 50 = 962.5
  });

  test("should handle zero base salary and zero penalties", async () => {
    const studentId1 = new mongoose.Types.ObjectId();
    User.find.mockResolvedValue([{ _id: studentId1 }]);
    const middleOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 15);
    Wallet.find.mockResolvedValue([
      { user: studentId1, history: [{ reason: "topup", newBalance: 100, oldBalance: 0, createdAt: middleOfMonth }] },
    ]);

    const result = await calculateCoordinatorSalary(mockCoordinatorId, 0, 0);
    expect(result.totalTopupsThisMonth).toBe(100);
    expect(result.finalSalary).toBe(100 * 0.05); // 5
  });

  test("should use 0 for null/undefined baseSalary or penalties in calculation", async () => {
    User.find.mockResolvedValue([]); // No students, so topups will be 0

    let result = await calculateCoordinatorSalary(mockCoordinatorId, null, 50);
    expect(result.finalSalary).toBe(-50); // 0 + 0 - 50

    result = await calculateCoordinatorSalary(mockCoordinatorId, 1000, undefined);
    expect(result.finalSalary).toBe(1000); // 1000 + 0 - 0

    result = await calculateCoordinatorSalary(mockCoordinatorId, null, null);
    expect(result.finalSalary).toBe(0); // 0 + 0 - 0
  });

  test("should return base salary minus penalties if Wallet.find throws error", async () => {
    const students = [{ _id: new mongoose.Types.ObjectId() }];
    User.find.mockResolvedValue(students);
    Wallet.find.mockRejectedValue(new Error("DB error"));

    const result = await calculateCoordinatorSalary(mockCoordinatorId, 1200, 75);
    expect(result.finalSalary).toBe(1200 - 75); // 1125
    expect(result.totalTopupsThisMonth).toBe(0);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Error calculating salary"), expect.any(Error));
  });
});
