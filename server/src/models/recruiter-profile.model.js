import mongoose from "mongoose";

const recruiterProfileSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
		companyName: { type: String, required: true, trim: true, maxlength: 150 },
		industry: { type: String, trim: true, maxlength: 120, default: "" },
		employeeCount: { type: Number, min: 1, max: 1000000 },
		jobCategories: { type: [{ type: String, maxlength: 100 }], default: [] },
		companyDescription: { type: String, maxlength: 4000, default: "" },
		website: { type: String, maxlength: 500, default: "" },
	},
	{ timestamps: true, collection: "RecruiterProfiles" },
);

export default mongoose.model("RecruiterProfile", recruiterProfileSchema);
