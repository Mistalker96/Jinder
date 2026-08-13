import Notification from "../models/notification.model.js";

export async function getNotifications(req, res) {
	const [data, unread] = await Promise.all([
		Notification.find({ recipient: req.user._id })
			.sort({ createdAt: -1 })
			.limit(30)
			.lean(),
		Notification.countDocuments({ recipient: req.user._id, read: false }),
	]);
	return res.json({
		success: true,
		unread,
		data,
	});
}

export async function markNotificationsRead(req, res) {
	await Notification.updateMany(
		{ recipient: req.user._id, read: false },
		{ $set: { read: true } },
	);
	return res.json({ success: true });
}
