import { Banknote, Bookmark, BriefcaseBusiness, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getSession } from "../lib/session";
import { JobService } from "../services/jobService";
import { isJobOpen, jobDeadline, type Job } from "../types/job";
export function JobCard({ job }: { job: Job }) {
	const [saved, setSaved] = useState(false);
	const navigate = useNavigate();
	const open = isJobOpen(job);
	const toggleSaved = async () => {
		if (getSession()?.user.role !== "employee") return navigate("/dang-nhap");
		try {
			if (saved) await JobService.unsaveJob(job._id);
			else await JobService.saveJob(job._id);
			setSaved(!saved);
		} catch {
			navigate("/dang-nhap");
		}
	};
	return (
		<article className="job-card">
			<div className="job-logo">{job.job_title?.charAt(0).toUpperCase()}</div>
			<div className="job-card-body">
				<div className="job-card-head">
					<div>
						<h3>
							<Link to={`/viec-lam/${job._id}`}>{job.job_title}</Link>
						</h3>
						<p className="job-company">
							{job.company || job.job_fields || job.position_level}
						</p>
					</div>
					<button
						className="icon-button"
						aria-label="Lưu việc làm"
						onClick={toggleSaved}
						style={{ color: saved ? "var(--primary)" : undefined }}
					>
						<Bookmark size={18} fill={saved ? "currentColor" : "none"} />
					</button>
				</div>
				<div className="job-meta">
					<span>
						<MapPin size={15} />
						{job.city}
					</span>
					<span className="salary">
						<Banknote size={15} />
						{job.salary}
					</span>
					<span>
						<BriefcaseBusiness size={15} />
						{job.experience}
					</span>
				</div>
				<div className="tags">
					<span className={`tag ${open ? "primary" : ""}`}>
						{open ? "Còn tuyển dụng" : "Hết hạn"} ·{" "}
						{jobDeadline(job).toLocaleDateString("vi-VN")}
					</span>
					<span className="tag primary">{job.job_type}</span>
					<span className="tag">{job.position_level}</span>
					<span className="tag">{job.job_fields}</span>
				</div>
				<div className="job-card-footer">
					<Link
						className="button primary apply-now"
						to={`/viec-lam/${job._id}`}
					>
						{open ? "Ứng tuyển ngay" : "Xem chi tiết"}
					</Link>
				</div>
			</div>
		</article>
	);
}
