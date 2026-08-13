import mongoose from "mongoose";
import User from "../models/user.model.js";
import EmployeeProfile from "../models/employee-profile.model.js";
import Job from "../models/job.model.js";
import Conversation from "../models/conversation.model.js";
import RecruiterProfile from "../models/recruiter-profile.model.js";
import EmployerReview from "../models/employer-review.model.js";
import { number, text } from "../utils/validation.js";

const rating = (value, name) => {
	const result = number(value, name, { required: true, min: 1, max: 5 });
	if (!Number.isInteger(result))
		throw Object.assign(new Error(`${name} must be an integer from 1 to 5`), {
			status: 400,
		});
	return result;
};

const hasConversation = (first, second) =>
	Conversation.exists({
		participants: { $all: [first, second] },
	});

export async function upsertRecruiterReview(req, res) {
	try {
		if (!mongoose.isValidObjectId(req.params.id))
			return res
				.status(400)
				.json({ success: false, message: "Invalid user ID" });
		const recruiter = await User.findOne({
			_id: req.params.id,
			role: "recruiter",
		})
			.select("_id")
			.lean();
		if (!recruiter)
			return res
				.status(404)
				.json({ success: false, message: "Recruiter not found" });
		if (!(await hasConversation(req.user._id, recruiter._id)))
			return res
				.status(403)
				.json({
					success: false,
					message: "Bạn chỉ có thể đánh giá nhà tuyển dụng đã trò chuyện",
				});
		const input = {
			overall: rating(req.body.overall, "overall"),
			friendliness: rating(req.body.friendliness, "friendliness"),
			environment: rating(req.body.environment, "environment"),
			benefits: rating(req.body.benefits, "benefits"),
			comment: text(req.body.comment, "comment", { required: true, max: 2000 }),
		};
		const data = await EmployerReview.findOneAndUpdate(
			{ recruiter: recruiter._id, reviewer: req.user._id },
			input,
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true,
			},
		).lean();
		return res.json({ success: true, data });
	} catch (error) {
		return res
			.status(error.status || 400)
			.json({ success: false, message: error.message });
	}
}

export async function getPublicProfile(req, res) {
	if (!mongoose.isValidObjectId(req.params.id))
		return res.status(400).json({ success: false, message: "Invalid user ID" });
	const allowed = await hasConversation(req.user._id, req.params.id);
	if (!allowed)
		return res.status(403).json({
			success: false,
			message: "Bạn chỉ có thể xem hồ sơ của người đã trò chuyện",
		});
	const user = await User.findById(req.params.id)
		.select("username fullName avatar role address email phone createdAt")
		.lean();
	if (!user || user.role === "admin")
		return res
			.status(404)
			.json({ success: false, message: "Profile not found" });
	if (user.role === req.user.role)
		return res
			.status(403)
			.json({
				success: false,
				message: "Profile is not available for this account role",
			});
	if (user.role === "employee") {
		const profile = await EmployeeProfile.findOne({ user: user._id })
			.select(
				"fullName targetPosition skills experience education expectedSalary cvUrl",
			)
			.lean();
		return res.json({ success: true, data: { user, profile, jobs: [] } });
	}
	const [profile, jobs, reviews, summary] = await Promise.all([
		RecruiterProfile.findOne({ user: user._id })
			.select(
				"companyName industry employeeCount jobCategories companyDescription website",
			)
			.lean(),
		Job.find({ owner: user._id })
			.select("job_title company city job_type expiresAt createdAt")
			.sort({ createdAt: -1 })
			.limit(12)
			.lean(),
		EmployerReview.find({ recruiter: user._id })
			.populate("reviewer", "username fullName avatar")
			.sort({ updatedAt: -1 })
			.limit(100)
			.lean(),
		EmployerReview.aggregate([
			{ $match: { recruiter: user._id } },
			{
				$group: {
					_id: null,
					count: { $sum: 1 },
					overall: { $avg: "$overall" },
					friendliness: { $avg: "$friendliness" },
					environment: { $avg: "$environment" },
					benefits: { $avg: "$benefits" },
				},
			},
		]),
	]);
	const myReview =
		reviews.find(
			(review) => String(review.reviewer?._id) === String(req.user._id),
		) || null;
	return res.json({
		success: true,
		data: {
			user,
			profile,
			jobs,
			reviews,
			myReview,
			ratingSummary: summary[0] || {
				count: 0,
				overall: 0,
				friendliness: 0,
				environment: 0,
				benefits: 0,
			},
		},
	});
}
