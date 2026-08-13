import { createHmac, timingSafeEqual } from "node:crypto";
const encode = (value) =>
	Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (value) => {
	const secret = process.env.AUTH_SECRET;
	if (!secret) throw new Error("AUTH_SECRET is required");
	return createHmac("sha256", secret).update(value).digest("base64url");
};

export function createToken(user) {
	const payload = encode({
		sub: user._id.toString(),
		role: user.role,
		exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
	});
	return `${payload}.${sign(payload)}`;
}
export function readToken(token) {
	const [payload, signature] = token?.split(".") ?? [];
	if (!payload || !signature) return null;
	const expected = sign(payload);
	if (
		signature.length !== expected.length ||
		!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
	)
		return null;
	try {
		const data = JSON.parse(Buffer.from(payload, "base64url").toString());
		return data.exp > Date.now() ? data : null;
	} catch {
		return null;
	}
}
