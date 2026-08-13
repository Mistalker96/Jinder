import SavedJob from "../models/saved-job.model.js";
import Job from "../models/job.model.js";

export async function apiSaveJob(req, res) {
	const job = await Job.findById(req.params.jobId);
	if (!job)
		return res.status(404).json({ success: false, message: "Job not found" });
	await SavedJob.updateOne(
		{ user: req.user._id, job: job._id },
		{ $setOnInsert: { user: req.user._id, job: job._id } },
		{ upsert: true },
	);
	return res.status(201).json({ success: true });
}
export async function apiGetSavedJobs(req, res) {
	const saved = await SavedJob.find({ user: req.user._id })
		.populate("job")
		.sort({ createdAt: -1 })
		.lean();
	return res.json({
		success: true,
		data: saved.filter((item) => item.job).map((item) => item.job),
	});
}
export async function apiDeleteSavedJob(req, res) {
	await SavedJob.deleteOne({ user: req.user._id, job: req.params.jobId });
	return res.json({ success: true });
}
