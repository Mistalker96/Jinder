import express from "express";
import {
	apiDeleteSavedJob,
	apiGetSavedJobs,
	apiSaveJob,
} from "../controllers/saved-job.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
const router = express.Router();
router.get("/", requireAuth, allowRoles("employee"), apiGetSavedJobs);
router.post("/:jobId", requireAuth, allowRoles("employee"), apiSaveJob);
router.delete(
	"/:jobId",
	requireAuth,
	allowRoles("employee"),
	apiDeleteSavedJob,
);
export default router;
