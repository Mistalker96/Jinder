import { getSession } from "../lib/session";

export type Notification = {
	_id: string;
	title: string;
	message: string;
	link: string;
	read: boolean;
	createdAt: string;
};

const headers = () => ({
	Authorization: `Bearer ${getSession()?.token || ""}`,
});

export const NotificationService = {
	async get(signal?: AbortSignal) {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/notifications`,
			{
				headers: headers(),
				signal,
			},
		);
		if (!response.ok) throw new Error("Không thể tải thông báo");
		return response.json() as Promise<{ unread: number; data: Notification[] }>;
	},
	async markRead() {
		await fetch(`${import.meta.env.VITE_API_URL}/notifications/read`, {
			method: "PATCH",
			headers: headers(),
		});
	},
};
