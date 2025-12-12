import User from "../models/User";
import logger from "./logger";
import { config } from "../config/index";

/**
 * Create Test Student Account
 * Username: teststudent
 * Password: TestStudent#2025
 * Full access to CPA course for development/testing
 */
export const createTestStudent = async (): Promise<void> => {
  try {
    const testEmail = "teststudent@agiaccountant.com";

    // Check if test student already exists
    const existingTestStudent = await User.findOne({ email: testEmail });

    if (existingTestStudent) {
      logger.info("Test Student already exists");
      return;
    }

    // Create test student with full access
    const testStudent = await User.create({
      email: testEmail,
      password: "TestStudent#2025",
      firstName: "Test",
      lastName: "Student",
      role: "student",
      isActive: true,
      isEmailVerified: true,
      paymentStatus: "free_access", // Bypass payment requirement
      courseProgress: 0,
    });

    logger.info("✅ Test Student account created successfully");
    logger.info(`Email: ${testStudent.email}`);
    logger.info("Password: TestStudent#2025");
    logger.info("Access: Full CPA Course (Payment bypassed)");
  } catch (error: any) {
    logger.error("Error creating Test Student:", error.message);
  }
};

export default createTestStudent;
