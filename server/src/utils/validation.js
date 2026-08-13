export const escapeRegex = (value) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const invalid = (message) => Object.assign(new Error(message), { status: 400 });

export function text(value, name, { required = false, max = 200 } = {}) {
	if (value === undefined || value === null) {
		if (required) throw invalid(`${name} is required`);
		return "";
	}
	if (typeof value !== "string") throw invalid(`${name} must be a string`);
	const normalized = value.trim();
	if (required && !normalized) throw invalid(`${name} is required`);
	if (normalized.length > max)
		throw invalid(`${name} must be at most ${max} characters`);
	return normalized;
}

export function number(
	value,
	name,
	{ required = false, min = 0, max = 1_000_000_000 } = {},
) {
	if (value === undefined || value === null || value === "") {
		if (required) throw invalid(`${name} is required`);
		return undefined;
	}
	const parsed = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(parsed) || parsed < min || parsed > max)
		throw invalid(`${name} must be a number between ${min} and ${max}`);
	return parsed;
}

export function date(value, name) {
	if (value === undefined || value === null || value === "") return undefined;
	if (typeof value !== "string") throw invalid(`${name} must be a date string`);
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime()))
		throw invalid(`${name} must be a valid date`);
	return parsed;
}
