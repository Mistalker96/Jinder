import { useEffect, useState } from "react";
import { JobService } from "../services/jobService";
import { isJobOpen, jobDeadline, type Job } from "../types/job";
const initial = {
	job_title: "",
	company: "",
	city: "",
	experience: "",
	salary_min: "",
	salary_max: "",
	expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
	job_fields: "Khác",
	job_type: "Toàn thời gian",
	position_level: "Nhân viên",
};
export default function RecruiterDashboard() {
	const [tab, setTab] = useState<"create" | "jobs">("create"),
		[form, setForm] = useState(initial),
		[jobs, setJobs] = useState<Job[]>([]),
		[message, setMessage] = useState("");
	const load = (signal?: AbortSignal) =>
		JobService.getMyRecruitJobs(signal)
			.then((result) => setJobs(result.data))
			.catch((error) => {
				if (error.name !== "AbortError")
					setMessage("Không thể tải tin đã đăng.");
			});
	useEffect(() => {
		const controller = new AbortController();
		if (tab === "jobs") load(controller.signal);
		return () => controller.abort();
	}, [tab]);
	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		setMessage("");
		try {
			await JobService.createRecruitJob({
				...form,
				salary_min: Number(form.salary_min),
				salary_max: Number(form.salary_max),
			});
			setForm(initial);
			setMessage("Đăng tin thành công.");
			setTab("jobs");
		} catch (error) {
			setMessage(
				error instanceof Error ? error.message : "Không thể đăng tin.",
			);
		}
	};
	return (
		<div className="container page">
			<span className="eyebrow">DÀNH CHO NHÀ TUYỂN DỤNG</span>
			<h1 className="title">Quản lý tin tuyển dụng</h1>
			<p className="muted">Đăng và quản lý các vị trí của doanh nghiệp bạn.</p>
			<div className="tabs">
				<button
					className={tab === "create" ? "active" : ""}
					onClick={() => setTab("create")}
				>
					Đăng tin mới
				</button>
				<button
					className={tab === "jobs" ? "active" : ""}
					onClick={() => setTab("jobs")}
				>
					Tin đã đăng
				</button>
			</div>
			{message && <p className="muted">{message}</p>}
			{tab === "create" ?
				<form className="panel employer-form" onSubmit={submit}>
					<div className="form-grid">
						<Field
							label="Hạn tuyển dụng"
							name="expiresAt"
							value={form.expiresAt}
							onChange={setForm}
							type="date"
							required
						/>
						<Field
							label="Tên vị trí tuyển dụng"
							name="job_title"
							value={form.job_title}
							onChange={setForm}
							required
						/>
						<Field
							label="Tên công ty"
							name="company"
							value={form.company}
							onChange={setForm}
							required
						/>
						<Field
							label="Địa điểm"
							name="city"
							value={form.city}
							onChange={setForm}
							required
						/>
						<Field
							label="Kinh nghiệm"
							name="experience"
							value={form.experience}
							onChange={setForm}
							required
						/>
						<Field
							label="Lương tối thiểu (triệu)"
							name="salary_min"
							value={form.salary_min}
							onChange={setForm}
							type="number"
							required
						/>
						<Field
							label="Lương tối đa (triệu)"
							name="salary_max"
							value={form.salary_max}
							onChange={setForm}
							type="number"
							required
						/>
					</div>
					<div className="form-grid">
						<Field
							label="Ngành nghề"
							name="job_fields"
							value={form.job_fields}
							onChange={setForm}
						/>
						<Field
							label="Loại hình"
							name="job_type"
							value={form.job_type}
							onChange={setForm}
						/>
					</div>
					<button className="button primary" style={{ marginTop: 20 }}>
						Đăng tin tuyển dụng
					</button>
				</form>
			:	<div className="job-list">
					{jobs.length ?
						jobs.map((job) => (
							<article className="panel" style={{ padding: 18 }} key={job._id}>
								<strong>{job.job_title}</strong>
								<p className="muted">
									{job.company} · {job.city} · {job.salary}
								</p>
								<span className={`tag ${isJobOpen(job) ? "primary" : ""}`}>
									{isJobOpen(job) ? "Còn tuyển dụng" : "Hết hạn"} · hạn{" "}
									{jobDeadline(job).toLocaleDateString("vi-VN")}
								</span>
							</article>
						))
					:	<div className="empty">Chưa có tin tuyển dụng nào.</div>}
				</div>
			}
		</div>
	);
}
function Field({
	label,
	name,
	value,
	onChange,
	type = "text",
	required = false,
}: {
	label: string;
	name: string;
	value: string;
	onChange: React.Dispatch<React.SetStateAction<typeof initial>>;
	type?: string;
	required?: boolean;
}) {
	return (
		<div className="form-group">
			<label>{label}</label>
			<input
				className="input"
				name={name}
				type={type}
				min={type === "number" ? 0 : undefined}
				required={required}
				value={value}
				onChange={(event) =>
					onChange((current) => ({ ...current, [name]: event.target.value }))
				}
			/>
		</div>
	);
}
