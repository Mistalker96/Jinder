import Job from "../models/job.model.js";
import SavedJob from "../models/saved-job.model.js";
import { date, escapeRegex, number, text } from "../utils/validation.js";
import Application from "../models/application.model.js";
import Notification from "../models/notification.model.js";
import { ensureConversation } from "../utils/conversation.js";

const fieldLimits = {
	job_title: 150,
	company: 150,
	city: 120,
	job_fields: 120,
	job_type: 80,
	position_level: 80,
	experience: 120,
	skills: 1000,
	unit: 20,
};
const clean = (name, value, required = false) =>
	text(value, name, { required, max: fieldLimits[name] });
class JobController {
	static async apiApply(req, res) {
		const job = await Job.findById(req.params.id).lean();
		if (!job)
			return res.status(404).json({ success: false, message: "Job not found" });
		const expiresAt =
			job.expiresAt ||
			new Date(new Date(job.createdAt).getTime() + 30 * 86400000);
		if (new Date(expiresAt) <= new Date())
			return res
				.status(400)
				.json({ success: false, message: "Tin tuyển dụng đã hết hạn" });
		if (!job.owner)
			return res
				.status(400)
				.json({
					success: false,
					message: "Tin tuyển dụng chưa có nhà tuyển dụng phụ trách",
				});
		try {
			await Application.create({ job: job._id, applicant: req.user._id });
		} catch (error) {
			if (error.code === 11000)
				return res
					.status(409)
					.json({ success: false, message: "Bạn đã ứng tuyển công việc này" });
			throw error;
		}
		const applicantName = req.user.fullName || req.user.username;
		try {
			await ensureConversation(req.user._id, job.owner);
			await Notification.create({
				recipient: job.owner,
				actor: req.user._id,
				type: "application",
				title: "Có ứng viên mới",
				message: `${applicantName} đã ứng tuyển vị trí ${job.job_title}`,
				link: "/ung-vien-match",
			});
		} catch (error) {
			await Application.deleteOne({ job: job._id, applicant: req.user._id });
			throw error;
		}
		return res
			.status(201)
			.json({ success: true, message: "Ứng tuyển thành công" });
	}
static async apiPostRecruit(req, res) {
		try {
			const {
				job_title,
				company,
				city,
				job_fields = "Khác",
				job_type = "Toàn thời gian",
				position_level = "Nhân viên",
				experience,
				skills = "",
				salary_min,
				salary_max,
				unit = "triệu",
				expiresAt,
			} = req.body;
			const minimum = number(salary_min, "salary_min", { required: true });
			const maximum = number(salary_max, "salary_max", { required: true });
			if (
				!job_title ||
				!company ||
				!city ||
				!experience ||
				salary_min === undefined ||
				salary_max === undefined
			)
				return res.status(400).json({
					success: false,
					message:
						"job_title, company, city, experience, salary_min and salary_max are required",
				});
			if (minimum > maximum)
				return res.status(400).json({
					success: false,
					message: "salary_min must not exceed salary_max",
				});
			const salary = `${salary_min} - ${salary_max} ${unit}`;
			const job = await Job.create({
				job_title: clean("job_title", job_title, true),
				company: clean("company", company, true),
				city: clean("city", city, true),
				job_fields: clean("job_fields", job_fields),
				job_type: clean("job_type", job_type),
				position_level: clean("position_level", position_level),
				experience: clean("experience", experience, true),
				skills: clean("skills", skills),
				salary,
				salary_min: minimum,
				salary_max: maximum,
				unit: clean("unit", unit),
				expiresAt: date(expiresAt, "expiresAt"),
				owner: req.user._id,
			});
			return res.status(201).json({ success: true, data: job });
		} catch (error) {
			return res.status(400).json({ success: false, message: error.message });
		}
	}
static async apiUpdateRecruit(req, res) {
		const job = await Job.findById(req.params.id);
		if (!job)
			return res.status(404).json({ success: false, message: "Job not found" });
		if (
			req.user.role !== "admin" &&
			job.owner?.toString() !== req.user._id.toString()
		)
			return res
				.status(403)
				.json({ success: false, message: "Permission denied" });
		const allowed = [
			"job_title",
			"company",
			"job_type",
			"position_level",
			"city",
			"experience",
			"skills",
			"job_fields",
			"salary_min",
			"salary_max",
			"unit",
			"expiresAt",
		];
		allowed.forEach((field) => {
			if (req.body[field] === undefined) return;
			if (field === "salary_min" || field === "salary_max")
				job[field] = number(req.body[field], field, { required: true });
			else if (field === "expiresAt") job[field] = date(req.body[field], field);
			else
				job[field] = clean(
					field,
					req.body[field],
					["job_title", "company", "city", "experience"].includes(field),
				);
		});
		if (job.salary_min > job.salary_max)
			return res.status(400).json({
				success: false,
				message: "salary_min must not exceed salary_max",
			});
		job.salary = `${job.salary_min} - ${job.salary_max} ${job.unit || "triệu"}`;
		await job.save();
		return res.json({ success: true, data: job });
	}
static async apiGetMyRecruitJobs(req, res) {
		const filter = req.user.role === "admin" ? {} : { owner: req.user._id };
		const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
		return res.json({ success: true, data: jobs });
	}
static async apiDeleteRecruit(req, res) {
		const job = await Job.findById(req.params.id);
		if (!job)
			return res.status(404).json({ success: false, message: "Job not found" });
		if (
			req.user.role !== "admin" &&
			job.owner?.toString() !== req.user._id.toString()
		)
			return res
				.status(403)
				.json({ success: false, message: "Permission denied" });
		await Promise.all([
			SavedJob.deleteMany({ job: job._id }),
			Application.deleteMany({ job: job._id }),
		]);
		await job.deleteOne();
		return res.json({ success: true });
	}
static async apiGetJobs(req, res) {
		try {
			const page = number(req.query.page ?? 1, "page", {
				min: 1,
				max: 1000000,
			});
			const limit = number(req.query.limit ?? 20, "limit", {
				min: 1,
				max: 100,
			});
			if (!Number.isInteger(page) || !Number.isInteger(limit))
				throw Object.assign(new Error("page and limit must be integers"), {
					status: 400,
				});
			const skip = (page - 1) * limit;
			const {
				keyword,
				city,
				job_type,
				position_level,
				experience,
				job_fields,
				salary_min,
				salary_max,
				sort,
			} = req.query;
			const filter = {};

			const regex = (value, name) =>
				escapeRegex(text(value, name, { max: 100 }));
			if (keyword) {
				const safeKeyword = regex(keyword, "keyword");
				filter.$or = [
					{ job_title: { $regex: safeKeyword, $options: "i" } },
					{ skills: { $regex: safeKeyword, $options: "i" } },
					{ job_fields: { $regex: safeKeyword, $options: "i" } },
				];
			}

			if (city) filter.city = { $regex: regex(city, "city"), $options: "i" };
			if (job_type)
				filter.job_type = {
					$regex: regex(job_type, "job_type"),
					$options: "i",
				};
			if (position_level)
				filter.position_level = {
					$regex: regex(position_level, "position_level"),
					$options: "i",
				};
			if (experience)
				filter.experience = {
					$regex: regex(experience, "experience"),
					$options: "i",
				};
			if (job_fields)
				filter.job_fields = {
					$regex: regex(job_fields, "job_fields"),
					$options: "i",
				};

			if (salary_min && salary_max) {
				filter.salary_min = { $lte: number(salary_max, "salary_max") };
				filter.salary_max = { $gte: number(salary_min, "salary_min") };
			} else if (salary_min) {
				filter.salary_max = { $gte: number(salary_min, "salary_min") };
			} else if (salary_max) {
				filter.salary_min = { $lte: number(salary_max, "salary_max") };
			}
			let sortOption = {};

			if (sort === "salary_asc") sortOption = { salary_min: 1 };
			if (sort === "salary_desc") sortOption = { salary_max: -1 };
			if (sort === "newest") sortOption = { createdAt: -1 };
			const [jobs, totalJobs] = await Promise.all([
				Job.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
				Job.countDocuments(filter),
			]);

			const totalPages = Math.ceil(totalJobs / limit);

			res.status(200).json({
				success: true,
				pagination: {
					currentPage: page,
					limit,
					totalJobs,
					totalPages,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
				filters: {
					keyword: keyword || null,
					city: city || null,
					job_type: job_type || null,
					position_level: position_level || null,
					experience: experience || null,
					job_fields: job_fields || null,
					salary_min: salary_min || null,
					salary_max: salary_max || null,
					sort: sort || null,
				},
				data: jobs,
			});
		} catch (error) {
			console.error("Get jobs error:", error.message);
			res.status(error.status || 500).json({
				success: false,
				message: error.status ? error.message : "Failed to get jobs",
			});
		}
	}
static async apiGetJobById(req, res) {
		try {
			const job = await Job.findById(req.params.id).lean();

			if (!job) {
				return res.status(404).json({
					success: false,
					message: "Job not found",
				});
			}

			res.status(200).json({
				success: true,
				data: job,
			});
		} catch (error) {
			console.error("Get job by ID error:", error.message);

			res.status(400).json({
				success: false,
				message: "Invalid job ID",
			});
		}
	}
}

export default JobController;
