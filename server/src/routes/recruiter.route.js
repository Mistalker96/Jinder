import express from "express";
import { getMyRecruiterProfile, updateMyRecruiterProfile } from "../controllers/recruiter.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.route("/profile")
	.get(requireAuth, allowRoles("recruiter"), getMyRecruiterProfile)
	.put(requireAuth, allowRoles("recruiter"), updateMyRecruiterProfile);
export default router;

