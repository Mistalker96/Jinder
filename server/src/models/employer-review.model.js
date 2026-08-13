import mongoose from "mongoose";

const employerReviewSchema = new mongoose.Schema(
	{
		recruiter: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		reviewer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		overall: { type: Number, required: true, min: 1, max: 5 },
		friendliness: { type: Number, required: true, min: 1, max: 5 },
		environment: { type: Number, required: true, min: 1, max: 5 },
		benefits: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String, required: true, trim: true, maxlength: 2000 },
	},
	{ timestamps: true, collection: "EmployerReviews" },
);

employerReviewSchema.index({ recruiter: 1, reviewer: 1 }, { unique: true });

export default mongoose.model("EmployerReview", employerReviewSchema);
