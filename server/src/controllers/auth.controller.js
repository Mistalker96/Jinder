import User from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";
import { number, text } from "../utils/validation.js";
import EmployeeProfile from "../models/employee-profile.model.js";
import RecruiterProfile from "../models/recruiter-profile.model.js";
const publicUser = (user) => ({
	id: user._id,
	username: user.username,
	fullName: user.fullName,
	email: user.email,
	phone: user.phone,
	address: user.address,
	avatar: user.avatar,
	role: user.role,
});

export async function register(req, res) {
	const {
		username,
		password,
		fullName = "",
		email = "",
		phone = "",
		address = "",
		role = "employee",
	} = req.body;
	let cleanUsername, cleanPassword, cleanFullName, cleanEmail, cleanPhone, cleanAddress;
	try {
		cleanUsername = text(username, "username", { required: true, max: 50 });
		cleanPassword = text(password, "password", { required: true, max: 128 });
		cleanFullName = text(fullName, "fullName", { max: 120 });
		cleanEmail = text(email, "email", { max: 254 });
		cleanPhone = text(phone, "phone", { required: true, max: 30 });
		cleanAddress = text(address, "address", { required: true, max: 300 });
		if (cleanUsername.length < 3 || cleanPassword.length < 6)
			throw new Error(
				"Username must have 3 characters and password must have 6 characters",
			);
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
	if (!username || !password)
		return res
			.status(400)
			.json({ success: false, message: "Username and password are required" });
	if (!["employee", "recruiter"].includes(role))
		return res.status(400).json({ success: false, message: "Invalid role" });
	if (await User.exists({ username: cleanUsername.toLowerCase() }))
		return res
			.status(409)
			.json({ success: false, message: "Username already exists" });
	const user = await User.create({
		username: cleanUsername,
		passwordHash: await hashPassword(cleanPassword),
		fullName: cleanFullName,
		email: cleanEmail,
		phone: cleanPhone,
		address: cleanAddress,
		role,
	});
	try {
		if (role === "employee") {
			await EmployeeProfile.create({
				user: user._id,
				fullName: cleanFullName,
				targetPosition: text(req.body.targetPosition, "targetPosition", { required: true, max: 150 }),
				phone: cleanPhone,
				experience: text(req.body.experience, "experience", { max: 4000 }),
				education: text(req.body.education, "education", { max: 2000 }),
			});
		} else {
			await RecruiterProfile.create({
				user: user._id,
				companyName: text(req.body.companyName || cleanFullName, "companyName", { required: true, max: 150 }),
				industry: text(req.body.industry, "industry", { required: true, max: 120 }),
				employeeCount: number(req.body.employeeCount, "employeeCount", { required: true, min: 1, max: 1000000 }),
				jobCategories: text(req.body.jobCategories, "jobCategories", { max: 1000 }).split(",").map((item) => item.trim()).filter(Boolean).slice(0, 30),
			});
		}
	} catch (error) {
		await User.deleteOne({ _id: user._id });
		return res.status(400).json({ success: false, message: error.message });
	}
	return res
		.status(201)
		.json({ success: true, user: publicUser(user), token: createToken(user) });
}

export async function login(req, res) {
	const { username, password } = req.body;
	if (
		typeof username !== "string" ||
		typeof password !== "string" ||
		username.length > 50 ||
		password.length > 128
	)
		return res
			.status(401)
			.json({ success: false, message: "Invalid username or password" });
	const user = await User.findOne({ username: username.toLowerCase() });
	if (!user || !(await verifyPassword(password || "", user.passwordHash)))
		return res
			.status(401)
			.json({ success: false, message: "Invalid username or password" });
	return res.json({
		success: true,
		user: publicUser(user),
		token: createToken(user),
	});
}

export async function getUsers(req, res) {
	const users = await User.find()
		.select("username fullName email role createdAt")
		.sort({ createdAt: -1 })
		.lean();
	return res.json({ success: true, data: users });
}

export async function updateMe(req, res) {
	const allowed = ["fullName", "email", "phone", "address", "avatar"];
	const update = {};
	allowed.forEach((field) => {
		if (req.body[field] !== undefined)
			update[field] = text(req.body[field], field, {
				max: {
					fullName: 120,
					email: 254,
					phone: 30,
					address: 300,
					avatar: 1500000,
				}[field],
			});
	});
	const user = await User.findByIdAndUpdate(req.user._id, update, {
		new: true,
		runValidators: true,
	});
	return res.json({
		success: true,
		user: publicUser(user),
		token: createToken(user),
	});
}
