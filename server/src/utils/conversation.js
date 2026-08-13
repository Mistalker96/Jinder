import Conversation from "../models/conversation.model.js";

export async function ensureConversation(firstUser, secondUser) {
	const participants = [firstUser.toString(), secondUser.toString()].sort();
	return Conversation.findOneAndUpdate(
		{ participantKey: participants.join(":") },
		{ $setOnInsert: { participants, participantKey: participants.join(":") } },
		{ new: true, upsert: true },
	);
}
