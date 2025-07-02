import mongoose from "mongoose";
import { calculateCoordinatorSalary } from "../controllers/userController.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

// Mock the models
jest.mock("../models/User.js");
jest.mock("../models/Wallet.js");

describe("calculateCoordinatorSalary (penalties as percentage)", () => {
  let mockCoordinatorId;

  beforeEach(() => {
    User.find.mockReset();
    Wallet.find.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCoordinatorId = new mongoose.Types.ObjectId().toString();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("should return base salary adjusted by penalty percentage if coordinatorId is invalid", async () => {
    // If ID is invalid, topups are 0. Gross salary = baseSalary. Penalty applies to baseSalary.
    const baseSalary = 1000;
    const penaltyPercentage = 10; // 10%
    const expectedPenaltyAmount = baseSalary * (penaltyPercentage / 100); // 100
    const result = await calculateCoordinatorSalary("invalidId", baseSalary, penaltyPercentage);

    expect(result.finalSalary).toBe(baseSalary - expectedPenaltyAmount); // 1000 - 100 = 900
    expect(result.totalTopupsThisMonth).toBe(0);
    expect(console.error).toHaveBeenCalledWith("Invalid coordinatorId provided to calculateCoordinatorSalary");
  });

  test("should return base salary adjusted by penalty percentage if coordinator has no students", async () => {
    User.find.mockResolvedValue([]);
    const baseSalary = 1200;
    const penaltyPercentage = 10; // 10%
    const expectedPenaltyAmount = baseSalary * (penaltyPercentage / 100); // 120
    const result = await calculateCoordinatorSalary(mockCoordinatorId, baseSalary, penaltyPercentage);

    expect(User.find).toHaveBeenCalledWith({ coordinator: mockCoordinatorId, role: "student" });
    expect(result.finalSalary).toBe(baseSalary - expectedPenaltyAmount); // 1200 - 120 = 1080
    expect(result.totalTopupsThisMonth).toBe(0);
  });

  test("should correctly calculate salary with topups and percentage penalties", async () => {
    const studentId1 = new mongoose.Types.ObjectId();
    User.find.mockResolvedValue([{ _id: studentId1 }]);

    const now = new Date();
    const middleOfMonth = new Date(now.getFullYear(), now.getMonth(), 15);
    Wallet.find.mockResolvedValue([
      { user: studentId1, history: [{ reason: "topup", newBalance: 200, oldBalance: 0, createdAt: middleOfMonth }] }, // Topup: 200
    ]);

    const baseSalary = 1000;
    const penaltyPercentage = 10; // 10%
    const result = await calculateCoordinatorSalary(mockCoordinatorId, baseSalary, penaltyPercentage);

    const expectedTopups = 200;
    expect(result.totalTopupsThisMonth).toBe(expectedTopups);

    const bonus = expectedTopups * 0.05; // 200 * 0.05 = 10
    const grossSalaryBeforePenalty = baseSalary + bonus; // 1000 + 10 = 1010
    const expectedPenaltyAmount = grossSalaryBeforePenalty * (penaltyPercentage / 100); // 1010 * 0.10 = 101
    const expectedFinalSalary = grossSalaryBeforePenalty - expectedPenaltyAmount; // 1010 - 101 = 909

    expect(result.finalSalary).toBe(expectedFinalSalary);
  });

  test("should handle 0 penalty percentage", async () => {
    User.find.mockResolvedValue([]);
    const baseSalary = 1000;
    const penaltyPercentage = 0;
    const result = await calculateCoordinatorSalary(mockCoordinatorId, baseSalary, penaltyPercentage);
    expect(result.finalSalary).toBe(baseSalary); // 1000 + 0 - 0
    expect(result.totalTopupsThisMonth).toBe(0);
  });

  test("should handle 100% penalty", async () => {
    const studentId1 = new mongoose.Types.ObjectId();
    User.find.mockResolvedValue([{ _id: studentId1 }]);
    const middleOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 15);
    Wallet.find.mockResolvedValue([
      { user: studentId1, history: [{ reason: "topup", newBalance: 200, oldBalance: 0, createdAt: middleOfMonth }] },
    ]);

    const baseSalary = 1000;
    const penaltyPercentage = 100; // 100% penalty
    const result = await calculateCoordinatorSalary(mockCoordinatorId, baseSalary, penaltyPercentage);

    const expectedTopups = 200;
    const bonus = expectedTopups * 0.05; // 10
    const grossSalaryBeforePenalty = baseSalary + bonus; // 1010
    const expectedPenaltyAmount = grossSalaryBeforePenalty * (penaltyPercentage / 100); // 1010 * 1 = 1010
    expect(result.finalSalary).toBe(grossSalaryBeforePenalty - expectedPenaltyAmount); // Should be 0
    expect(result.totalTopupsThisMonth).toBe(expectedTopups);
  });


  test("should use 0 for null/undefined baseSalary or penalties in calculation", async () => {
    User.find.mockResolvedValue([]);

    let result = await calculateCoordinatorSalary(mockCoordinatorId, null, 10); // 10% penalty on 0 gross
    expect(result.finalSalary).toBe(0);

    result = await calculateCoordinatorSalary(mockCoordinatorId, 1000, undefined); // 0% penalty
    expect(result.finalSalary).toBe(1000);

    result = await calculateCoordinatorSalary(mockCoordinatorId, null, null); // 0% penalty on 0 gross
    expect(result.finalSalary).toBe(0);
  });

  test("should calculate penalty on base salary if Wallet.find throws error", async () => {
    const students = [{ _id: new mongoose.Types.ObjectId() }];
    User.find.mockResolvedValue(students);
    Wallet.find.mockRejectedValue(new Error("DB error"));

    const baseSalary = 1200;
    const penaltyPercentage = 20; // 20%
    const result = await calculateCoordinatorSalary(mockCoordinatorId, baseSalary, penaltyPercentage);

    const expectedPenaltyOnError = baseSalary * (penaltyPercentage / 100); // 1200 * 0.20 = 240
    expect(result.finalSalary).toBe(baseSalary - expectedPenaltyOnError); // 1200 - 240 = 960
    expect(result.totalTopupsThisMonth).toBe(0);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Error calculating salary"), expect.any(Error));
  });
});
