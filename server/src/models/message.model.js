import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		conversation: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Conversation",
			required: true,
			index: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		content: { type: String, required: true, trim: true, maxlength: 1000 },
		read: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "Messages" },
);

export default mongoose.model("Message", messageSchema);
