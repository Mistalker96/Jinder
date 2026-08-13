import type { Job, JobResponse } from "../types/job";
import { getSession } from "../lib/session";
export class JobService {
	static async getJobs(
		params: Record<string, string | number> = {},
		signal?: AbortSignal,
	): Promise<JobResponse> {
		const query = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			query.append(key, String(value));
		});

		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/jobs?${query.toString()}`,
			{ signal },
		);

		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`);
		}

		return response.json();
	}
static async getJobById(
		id: string,
		signal?: AbortSignal,
	): Promise<{ success: boolean; data: Job }> {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${id}`, {
			signal,
		});

		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`);
		}

		return response.json();
	}
static async getMyRecruitJobs(
		signal?: AbortSignal,
	): Promise<{ success: boolean; data: Job[] }> {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/mine`, {
			headers: this.authHeaders(),
			signal,
		});
		if (!response.ok) throw new Error("Không thể tải tin đã đăng");
		return response.json();
	}
static async createRecruitJob(
		data: Partial<Job>,
	): Promise<{ success: boolean; data: Job }> {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
			method: "POST",
			headers: { "Content-Type": "application/json", ...this.authHeaders() },
			body: JSON.stringify(data),
		});
		const result = await response.json();
		if (!response.ok) throw new Error(result.message || "Không thể đăng tin");
		return result;
	}

	static async saveJob(id: string) {
		return this.savedRequest(id, "POST");
	}
	static async apply(id: string) {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/jobs/${id}/apply`,
			{
				method: "POST",
				headers: this.authHeaders(),
			},
		);
		const result = await response.json();
		if (!response.ok) throw new Error(result.message || "Không thể ứng tuyển");
		return result;
	}
	static async unsaveJob(id: string) {
		return this.savedRequest(id, "DELETE");
	}
	static async getSavedJobs(
		signal?: AbortSignal,
	): Promise<{ success: boolean; data: Job[] }> {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/saved-jobs`, {
			headers: this.authHeaders(),
			signal,
		});
		if (!response.ok) throw new Error("Không thể tải việc đã lưu");
		return response.json();
	}
	private static authHeaders(): Record<string, string> {
		const token = getSession()?.token;
		return token ? { Authorization: `Bearer ${token}` } : {};
	}
	private static async savedRequest(id: string, method: "POST" | "DELETE") {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/saved-jobs/${id}`,
			{ method, headers: this.authHeaders() },
		);
		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.message || "Không thể lưu việc làm");
		}
	}
}
