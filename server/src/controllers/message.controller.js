import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { text } from "../utils/validation.js";

const ownsConversation = (conversation, userId) =>
	conversation?.participants.some(
		(participant) => participant._id.toString() === userId.toString(),
	);

export async function getInbox(req, res) {
	const conversations = await Conversation.find({ participants: req.user._id })
		.populate("participants", "username fullName avatar role")
		.sort({ lastMessageAt: -1 })
		.limit(50)
		.lean();
	const unread = await Message.countDocuments({
		recipient: req.user._id,
		read: false,
	});
	const data = await Promise.all(
		conversations.map(async (conversation) => ({
			...conversation,
			otherUser: conversation.participants.find(
				(user) => user._id.toString() !== req.user._id.toString(),
			),
			lastMessage: await Message.findOne({ conversation: conversation._id })
				.sort({ createdAt: -1 })
				.lean(),
			unread: await Message.countDocuments({
				conversation: conversation._id,
				recipient: req.user._id,
				read: false,
			}),
		})),
	);
	return res.json({ success: true, unread, data });
}

export async function getMessages(req, res) {
	const conversation = await Conversation.findById(req.params.id).populate(
		"participants",
		"username fullName avatar role",
	);
	if (!ownsConversation(conversation, req.user._id))
		return res
			.status(404)
			.json({ success: false, message: "Conversation not found" });
	await Message.updateMany(
		{ conversation: conversation._id, recipient: req.user._id, read: false },
		{ $set: { read: true } },
	);
	const [latestMessages, unread] = await Promise.all([
		Message.find({ conversation: conversation._id })
			.sort({ createdAt: -1 })
			.limit(200)
			.lean(),
		Message.countDocuments({ recipient: req.user._id, read: false }),
	]);
	return res.json({ success: true, unread, data: latestMessages.reverse() });
}

export async function sendMessage(req, res) {
	const conversation = await Conversation.findById(req.params.id).populate(
		"participants",
		"username fullName avatar role",
	);
	if (!ownsConversation(conversation, req.user._id))
		return res
			.status(404)
			.json({ success: false, message: "Conversation not found" });
	let content;
	try {
		content = text(req.body.content, "content", { required: true, max: 1000 });
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
	const recipient = conversation.participants.find(
		(user) => user._id.toString() !== req.user._id.toString(),
	);
	const message = await Message.create({
		conversation: conversation._id,
		sender: req.user._id,
		recipient: recipient._id,
		content,
	});
	conversation.lastMessageAt = message.createdAt;
	await conversation.save();
	return res.status(201).json({ success: true, data: message });
}
