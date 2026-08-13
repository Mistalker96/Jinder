import { Banknote, Gift, Heart, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { JobService } from "../services/jobService";
import type { Job } from "../types/job";
export default function JinderMatch() {
	const [jobs, setJobs] = useState<Job[]>([]),
		[index, setIndex] = useState(0),
		[message, setMessage] = useState("");
	useEffect(() => {
		const controller = new AbortController();
		JobService.getJobs({ limit: 50, sort: "newest" }, controller.signal)
			.then((result) => setJobs(result.data))
			.catch((error) => {
				if (error.name !== "AbortError") setJobs([]);
			});
		return () => controller.abort();
	}, []);
	const job = jobs[index];
	const choose = async (save: boolean) => {
		if (save && job) {
			try {
				await JobService.saveJob(job._id);
				setMessage("Đã lưu việc làm!");
			} catch {
				setMessage("Vui lòng đăng nhập tài khoản người dùng.");
				return;
			}
		}
		setIndex((current) => current + 1);
	};
	return (
		<div className="container page">
			<span className="eyebrow">JINDER MATCH</span>
			<h1 className="title">Quẹt để tìm việc phù hợp</h1>
			<p className="muted">
				Vuốt trái để bỏ qua, vuốt phải hoặc bấm tim để lưu việc làm.
			</p>
			{message && <p className="muted">{message}</p>}
			<div className="match-card panel">
				{job ?
					<>
						<div
							className="match-visual match-company-logo"
							aria-label="Logo công ty"
						>
							{job.company?.slice(0, 2).toUpperCase() || "CT"}
						</div>
						<h2>{job.job_title}</h2>
						<p className="muted">{job.company || job.job_fields}</p>
						<p>
							{job.city} · {job.experience}
						</p>
						<div className="match-highlights">
							<div>
								<Banknote size={19} />
								<span>
									Mức lương<strong>{job.salary}</strong>
								</span>
							</div>
							<div>
								<MapPin size={19} />
								<span>
									Địa điểm<strong>{job.city}</strong>
								</span>
							</div>
							<div>
								<Gift size={19} />
								<span>
									Đãi ngộ<strong>Trao đổi khi phỏng vấn</strong>
								</span>
							</div>
						</div>
						<div className="match-actions">
							<button
								className="match-button skip"
								onClick={() => choose(false)}
								aria-label="Bỏ qua"
							>
								<X />
							</button>
							<button
								className="match-button like"
								onClick={() => choose(true)}
								aria-label="Lưu việc làm"
							>
								<Heart />
							</button>
						</div>
					</>
				:	<div className="empty">Bạn đã xem hết việc làm. Hãy quay lại sau!</div>
				}
			</div>
		</div>
	);
}
