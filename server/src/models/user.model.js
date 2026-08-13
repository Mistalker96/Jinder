import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			minlength: 3,
			maxlength: 50,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			maxlength: 254,
			default: "",
		},
		fullName: { type: String, trim: true, maxlength: 120, default: "" },
		phone: { type: String, trim: true, maxlength: 30, default: "" },
		address: { type: String, trim: true, maxlength: 300, default: "" },
		avatar: { type: String, maxlength: 1500000, default: "" },
		passwordHash: { type: String, required: true },
		role: {
			type: String,
			enum: ["employee", "recruiter", "admin"],
			required: true,
		},
	},
	{ timestamps: true, collection: "Users" },
);
export default mongoose.model("User", userSchema);
