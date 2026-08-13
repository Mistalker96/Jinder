import { Bookmark, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSession } from "../lib/session";
import { JobCard } from "../components/JobCard";
import { JobService } from "../services/jobService";
import type { Job } from "../types/job";
export default function EmployeeDashboard() {
	const user = getSession()!.user;
	const [saved, setSaved] = useState<Job[]>([]),
		[loading, setLoading] = useState(true);
	useEffect(() => {
		const controller = new AbortController();
		JobService.getSavedJobs(controller.signal)
			.then((result) => setSaved(result.data))
			.catch((error) => {
				if (error.name !== "AbortError") setSaved([]);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, []);
	return (
		<div className="container page">
			<div className="profile-card panel">
				<span className="avatar">
					{user.avatar ?
						<img src={user.avatar} alt="Ảnh đại diện" />
					:	<User size={25} />}
				</span>
				<div>
					<h1 className="title" style={{ fontSize: 28 }}>
						{user.fullName || user.username}
					</h1>
					<p className="muted">
						Ứng viên · {user.address || "Chưa cập nhật địa chỉ"}
					</p>
				</div>
				<Link className="button" to="/tai-khoan">
					Chỉnh sửa hồ sơ
				</Link>
			</div>
			<div className="section-head" style={{ marginTop: 38 }}>
				<div>
					<h2>
						<Bookmark size={22} style={{ verticalAlign: "middle" }} /> Việc đã
						lưu
					</h2>
					<p>Những công việc bạn đã thích trên Jinder Match.</p>
				</div>
				<strong>{saved.length} việc làm</strong>
			</div>
			{loading ?
				<div className="empty" style={{ marginTop: 20 }}>
					Đang tải việc đã lưu...
				</div>
			: saved.length ?
				<div className="job-list">
					{saved.map((job) => (
						<JobCard key={job._id} job={job} />
					))}
				</div>
			:	<div className="empty" style={{ marginTop: 20 }}>
					Bạn chưa lưu việc làm nào.
					<br />
					<Link className="button" style={{ marginTop: 14 }} to="/jinder-match">
						Khám phá Jinder Match
					</Link>
				</div>
			}
		</div>
	);
}
