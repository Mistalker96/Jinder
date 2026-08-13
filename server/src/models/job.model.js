import mongoose from "mongoose";
const jobSchema = new mongoose.Schema(
	{
		job_title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 150,
		},
		company: {
			type: String,
			default: "",
			trim: true,
			maxlength: 150,
		},
		job_type: {
			type: String,
			trim: true,
			maxlength: 80,
		},
		position_level: {
			type: String,
			trim: true,
			maxlength: 80,
		},
		city: {
			type: String,
			trim: true,
			maxlength: 120,
		},
		experience: {
			type: String,
			trim: true,
			maxlength: 120,
		},
		skills: {
			type: String,
			trim: true,
			maxlength: 1000,
		},
		job_fields: {
			type: String,
			trim: true,
			maxlength: 120,
		},
		salary: {
			type: String,
		},
		salary_min: {
			type: Number,
			min: 0,
			max: 1000000000,
		},
		salary_max: {
			type: Number,
			min: 0,
			max: 1000000000,
		},
		unit: {
			type: String,
			trim: true,
			maxlength: 20,
		},
		expiresAt: {
			type: Date,
			default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		collection: "Jobs",
		timestamps: true,
	},
);
const Job = mongoose.model("Job", jobSchema);

export default Job;
