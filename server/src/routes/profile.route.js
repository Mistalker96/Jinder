import express from "express";
import { getPublicProfile, upsertRecruiterReview } from "../controllers/profile.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.put(
	"/:id/review",
	requireAuth,
	allowRoles("employee"),
	upsertRecruiterReview,
);
router.get(
	"/:id",
	requireAuth,
	allowRoles("employee", "recruiter"),
	getPublicProfile,
);

export default router;
