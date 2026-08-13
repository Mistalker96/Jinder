import type { Session } from "../services/authService";
const KEY = "jinder.session";
export function getSession(): Session | null {
	try {
		return JSON.parse(localStorage.getItem(KEY) || "null");
	} catch {
		return null;
	}
}

export function saveSession(session: Session) {
	localStorage.setItem(KEY, JSON.stringify(session));
	window.dispatchEvent(new Event("jinder-auth-change"));
}

export function clearSession() {
	localStorage.removeItem(KEY);
	window.dispatchEvent(new Event("jinder-auth-change"));
}
