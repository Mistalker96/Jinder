import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		actor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: { type: String, enum: ["application", "contact"], required: true },
		title: { type: String, required: true, maxlength: 150 },
		message: { type: String, required: true, maxlength: 500 },
		link: { type: String, maxlength: 300, default: "" },
		read: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "Notifications" },
);

export default mongoose.model("Notification", notificationSchema);
