import dotenv from "dotenv";
import dns from "node:dns";
import connectDatabase from "../config/database.js";
import User from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const accounts = [
	{
		username: "employ1",
		password: "123456",
		role: "employee",
		fullName: "Người dùng mô phỏng",
	},
	{
		username: "recruit1",
		password: "123456",
		role: "recruiter",
		fullName: "Nhà tuyển dụng mô phỏng",
	},
	{
		username: "admin",
		password: "123456",
		role: "admin",
		fullName: "Quản trị viên",
	},
];

try {
	await connectDatabase();
	for (const account of accounts) {
		await User.findOneAndUpdate(
			{ username: account.username },
			{ ...account, passwordHash: await hashPassword(account.password) },
			{ upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
		);
	}
	console.log("Seeded employee, recruiter and admin accounts");
	process.exit(0);
} catch (error) {
	console.error("User seed failed:", error.message);
	process.exit(1);
}
