import mongoose from "mongoose";
const employeeProfileSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		fullName: { type: String, required: true, trim: true, maxlength: 120 },
		phone: { type: String, trim: true, maxlength: 30, default: "" },
		targetPosition: {
			type: String,
			required: true,
			trim: true,
			maxlength: 150,
		},
		skills: {
			type: [{ type: String, maxlength: 100 }],
			validate: {
				validator: (items) => items.length <= 50,
				message: "skills must have at most 50 items",
			},
			default: [],
		},
		experience: { type: String, maxlength: 4000, default: "" },
		education: { type: String, maxlength: 2000, default: "" },
		expectedSalary: { type: Number, min: 0, max: 1000000000 },
		cvUrl: { type: String, maxlength: 1500000, default: "" },
	},
	{ timestamps: true, collection: "EmployeeProfiles" },
);
export default mongoose.model("EmployeeProfile", employeeProfileSchema);
