import {
	randomBytes,
	scrypt as scryptCallback,
	timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	const hash = await scrypt(password, salt, 64);
	return `${salt}:${Buffer.from(hash).toString("hex")}`;
}
export async function verifyPassword(password, storedHash) {
	const [salt, hash] = storedHash.split(":");
	if (!salt || !hash) return false;
	const candidate = Buffer.from(await scrypt(password, salt, 64));
	const expected = Buffer.from(hash, "hex");
	return (
		candidate.length === expected.length && timingSafeEqual(candidate, expected)
	);
}
