export interface Job {
	_id: string;
	job_title: string;
	company: string;
	job_type: string;
	position_level: string;
	city: string;
	experience: string;
	skills: string;
	job_fields: string;
	salary: string;
	salary_min: number;
	salary_max: number;
	unit: string;
	createdAt?: string;
	expiresAt?: string;
}

export const jobDeadline = (job: Job) =>
	job.expiresAt ? new Date(job.expiresAt) : new Date(new Date(job.createdAt || 0).getTime() + 30 * 86400000);

export const isJobOpen = (job: Job) => jobDeadline(job).getTime() > Date.now();
export interface JobResponse {
	success: boolean;
	pagination: {
		currentPage: number;
		limit: number;
		totalJobs: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
	data: Job[];
}
