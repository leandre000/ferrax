import express from 'express';
import { protect, requireAdmin } from '../middlewares/auth.middleware.js';
import { getMyTestDrives, getScheduledTestDrives, scheduleTestDrive, confirmTestDrive, deleteTestDrive, cancelTestDrive } from '../controllers/test-drive.controllers.js';

const testDriveRouter = express.Router();

testDriveRouter.get("/", protect, requireAdmin, getScheduledTestDrives);
testDriveRouter.get("/me", protect, getMyTestDrives);
testDriveRouter.post("/", protect, scheduleTestDrive);
testDriveRouter.put("/:id/confirm", protect, requireAdmin, confirmTestDrive);
testDriveRouter.put("/:id/cancel", protect, requireAdmin, cancelTestDrive);
testDriveRouter.delete("/:id", protect, deleteTestDrive);

export default testDriveRouter