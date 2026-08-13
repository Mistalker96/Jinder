import express from "express";
import {
	getInbox,
	getMessages,
	sendMessage,
} from "../controllers/message.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth, allowRoles("employee", "recruiter"));
router.get("/", getInbox);
router.get("/:id", getMessages);
router.post("/:id", sendMessage);

export default router;
