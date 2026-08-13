import User from "../models/user.model.js";
import { readToken } from "../utils/token.js";

export async function requireAuth(req, res, next) {
	const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
	const payload = readToken(token);
	if (!payload)
		return res
			.status(401)
			.json({ success: false, message: "Authentication required" });
	const user = await User.findById(payload.sub).lean();
	if (!user)
		return res
			.status(401)
			.json({ success: false, message: "Account not found" });
	req.user = user;
	next();
}

export function allowRoles(...roles) {
	return (req, res, next) =>
		roles.includes(req.user.role) ? next() : (
			res.status(403).json({ success: false, message: "Permission denied" })
		);
}
