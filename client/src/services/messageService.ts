import { getSession } from "../lib/session";

export type ChatUser = {
	_id: string;
	username: string;
	fullName: string;
	avatar?: string;
	role: string;
};
export type ChatMessage = {
	_id: string;
	sender: string;
	recipient: string;
	content: string;
	read: boolean;
	createdAt: string;
};
export type Conversation = {
	_id: string;
	otherUser: ChatUser;
	lastMessage?: ChatMessage;
	unread: number;
};

const authHeaders = () => ({
	Authorization: `Bearer ${getSession()?.token || ""}`,
});

async function request(path = "", options: RequestInit = {}) {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/messages${path}`,
		{
			...options,
			headers: { ...authHeaders(), ...options.headers },
		},
	);
	const result = await response.json();
	if (!response.ok)
		throw new Error(result.message || "Không thể xử lý tin nhắn");
	return result;
}

export const MessageService = {
	inbox: (signal?: AbortSignal) =>
		request("", { signal }) as Promise<{
			unread: number;
			data: Conversation[];
		}>,
	messages: (id: string, signal?: AbortSignal) =>
		request(`/${id}`, { signal }) as Promise<{
			unread: number;
			data: ChatMessage[];
		}>,
	send: (id: string, content: string) =>
		request(`/${id}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		}) as Promise<{ data: ChatMessage }>,
};
