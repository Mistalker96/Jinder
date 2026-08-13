import express from "express";
import {
	getUsers,
	login,
	register,
	updateMe,
} from "../controllers/auth.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.patch("/me", requireAuth, updateMe);
router.get("/users", requireAuth, allowRoles("admin"), getUsers);
export default router;
