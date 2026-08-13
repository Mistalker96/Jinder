import EmployeeProfile from "../models/employee-profile.model.js";
import { number, text } from "../utils/validation.js";
import Notification from "../models/notification.model.js";
import { ensureConversation } from "../utils/conversation.js";
export async function apiPostEmployee(req, res) {
	const {
		fullName,
		targetPosition,
		phone = "",
		skills = [],
		experience = "",
		education = "",
		expectedSalary,
		cvUrl = "",
	} = req.body;
	if (!Array.isArray(skills) || skills.length > 50)
		return res
			.status(400)
			.json({
				success: false,
				message: "skills must be an array with at most 50 items",
			});
	let input;
	try {
		if (cvUrl && (typeof cvUrl !== "string" || !/^data:application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,/i.test(cvUrl)))
			return res.status(400).json({ success: false, message: "CV must be a PDF, DOC or DOCX file" });
		input = {
			fullName: text(fullName, "fullName", { required: true, max: 120 }),
			targetPosition: text(targetPosition, "targetPosition", {
				required: true,
				max: 150,
			}),
			phone: text(phone, "phone", { max: 30 }),
			skills: skills.map((skill) =>
				text(skill, "skill", { required: true, max: 100 }),
			),
			experience: text(experience, "experience", { max: 4000 }),
			education: text(education, "education", { max: 2000 }),
			expectedSalary: number(expectedSalary, "expectedSalary"),
			cvUrl: text(cvUrl, "cvUrl", { max: 1500000 }),
		};
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
	if (!fullName || !targetPosition)
		return res.status(400).json({
			success: false,
			message: "fullName and targetPosition are required",
		});
	const profile = await EmployeeProfile.findOneAndUpdate(
		{ user: req.user._id },
		input,
		{ new: true, upsert: true, runValidators: true },
	);
	return res.status(201).json({ success: true, data: profile });
}

export async function getMyEmployeeProfile(req, res) {
	const profile = await EmployeeProfile.findOne({ user: req.user._id }).lean();
	return res.json({ success: true, data: profile });
}

export async function deleteMyEmployeeProfile(req, res) {
	await EmployeeProfile.deleteOne({ user: req.user._id });
	return res.json({ success: true });
}

export async function getEmployeeProfiles(req, res) {
	const profiles = await EmployeeProfile.find()
		.populate("user", "username email role")
		.sort({ updatedAt: -1 })
		.lean();
	return res.json({ success: true, data: profiles });
}

export async function contactEmployee(req, res) {
	const profile = await EmployeeProfile.findById(req.params.id).lean();
	if (!profile)
		return res
			.status(404)
			.json({ success: false, message: "Candidate not found" });
	const recruiterName = req.user.fullName || req.user.username;
	await ensureConversation(req.user._id, profile.user);
	await Notification.create({
		recipient: profile.user,
		actor: req.user._id,
		type: "contact",
		title: "Nhà tuyển dụng muốn liên hệ",
		message: `${recruiterName} quan tâm đến hồ sơ của bạn và muốn liên hệ`,
		link: "/tai-khoan",
	});
	return res
		.status(201)
		.json({ success: true, message: "Đã gửi thông báo liên hệ" });
}
