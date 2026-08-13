import express from "express";
import {
	getNotifications,
	markNotificationsRead,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.get("/", requireAuth, getNotifications);
router.patch("/read", requireAuth, markNotificationsRead);

export default router;
