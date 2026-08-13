import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		participants: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
			validate: {
				validator: (items) => items.length === 2,
				message: "Conversation requires two participants",
			},
			required: true,
		},
		participantKey: { type: String, required: true, unique: true },
		lastMessageAt: { type: Date, default: Date.now },
	},
	{ timestamps: true, collection: "Conversations" },
);

export default mongoose.model("Conversation", conversationSchema);
