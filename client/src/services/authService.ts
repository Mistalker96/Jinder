const API_URL = import.meta.env.VITE_API_URL;
export type AccountRole = "employee" | "recruiter" | "admin";
export interface Session {
	token: string;
	user: {
		id: string;
		username: string;
		fullName: string;
		email: string;
		phone?: string;
		address?: string;
		avatar?: string;
		role: AccountRole;
	};
}
async function request(path: string, body: Record<string, string>) {
	const response = await fetch(`${API_URL}/auth/${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = await response.json();
	if (!response.ok) throw new Error(data.message || "Không thể xử lý yêu cầu");
	return data as Session;
}
export const AuthService = {
	login: (username: string, password: string) =>
		request("login", { username, password }),
	register: (body: Record<string, string>) => request("register", body),
};
