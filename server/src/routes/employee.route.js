import express from "express";
import {
	apiPostEmployee,
	deleteMyEmployeeProfile,
	getEmployeeProfiles,
	getMyEmployeeProfile,
	contactEmployee,
} from "../controllers/employee.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
const router = express.Router();
router.get(
	"/profiles",
	requireAuth,
	allowRoles("recruiter", "admin"),
	getEmployeeProfiles,
);
router
	.route("/cv")
	.post(requireAuth, allowRoles("employee"), apiPostEmployee)
	.get(requireAuth, allowRoles("employee"), getMyEmployeeProfile)
	.delete(requireAuth, allowRoles("employee"), deleteMyEmployeeProfile);
router.post(
	"/profiles/:id/contact",
	requireAuth,
	allowRoles("recruiter", "admin"),
	contactEmployee,
);
export default router;
