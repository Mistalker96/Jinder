import express from "express";
import JobController from "../controllers/job.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
const router = express.Router();
router.get("/", JobController.apiGetJobs);
router.post(
	"/",
	requireAuth,
	allowRoles("recruiter", "admin"),
	JobController.apiPostRecruit,
);
router.get(
	"/mine",
	requireAuth,
	allowRoles("recruiter", "admin"),
	JobController.apiGetMyRecruitJobs,
);
router.get("/:id", JobController.apiGetJobById);
router.post(
	"/:id/apply",
	requireAuth,
	allowRoles("employee"),
	JobController.apiApply,
);
router.patch(
	"/:id",
	requireAuth,
	allowRoles("recruiter", "admin"),
	JobController.apiUpdateRecruit,
);
router.delete(
	"/:id",
	requireAuth,
	allowRoles("recruiter", "admin"),
	JobController.apiDeleteRecruit,
);
export default router;
