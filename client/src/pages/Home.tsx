import {
	ArrowRight,
	BriefcaseBusiness,
	Code2,
	Megaphone,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { JobCard } from "../components/JobCard";
import { SearchBar } from "../components/SearchBar";
import { JobService } from "../services/jobService";
import type { Job } from "../types/job";
import { PromoBanner } from "../components/PromoBanner";

const icons = [Code2, BriefcaseBusiness, Megaphone, Users];
export default function Home() {
	const [jobs, setJobs] = useState<Job[]>([]),
		[total, setTotal] = useState(0),
		[loading, setLoading] = useState(true);
	useEffect(() => {
		const controller = new AbortController();
		JobService.getJobs({ page: 1, limit: 4, sort: "newest" }, controller.signal)
			.then((res) => {
				setJobs(res.data);
				setTotal(res.pagination.totalJobs);
			})
			.catch((error) => {
				if (error.name !== "AbortError") setJobs([]);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, []);
	const categories = useMemo(
		() =>
			Object.entries(
				jobs.reduce<Record<string, number>>((result, job) => {
					job.job_fields
						?.split(",")
						.map((item) => item.trim())
						.filter(Boolean)
						.forEach((item) => (result[item] = (result[item] || 0) + 1));
					return result;
				}, {}),
			).slice(0, 6),
		[jobs],
	);
	return (
		<>
			<section className="hero">
				<div className="container hero-copy">
					<span className="eyebrow">CƠ HỘI MỚI MỖI NGÀY</span>
					<h1>
						Tìm công việc phù hợp.
						<br />
						Phát triển sự nghiệp.
					</h1>
					<p>
						Khám phá hàng nghìn vị trí chất lượng, lọc theo nhu cầu và ứng tuyển
						chỉ trong vài bước đơn giản.
					</p>
					<SearchBar />
					<div className="suggestions">
						<span>Gợi ý:</span>
						{["ReactJS", "Kế toán", "Marketing", "Remote"].map((item) => (
							<Link
								className="pill"
								key={item}
								to={`/viec-lam?keyword=${item}`}
							>
								{item}
							</Link>
						))}
					</div>
				</div>
			</section>
			<PromoBanner />
			<section className="section companies-section">
				<div className="container">
					<div className="section-head">
						<div>
							<h2>Công ty tiêu biểu</h2>
							<p>Khám phá các doanh nghiệp đang tuyển dụng trên Jinder.</p>
						</div>
						<Link className="button" to="/viec-lam">
							Xem công ty
						</Link>
					</div>
					<div className="company-grid">
						{[
							"FPT Software",
							"Tiki",
							"MoMo",
							"Viettel Solutions",
							"Shopee",
							"Vinamilk",
							"VNG Corporation",
							"Base.vn",
						].map((company) => (
							<Link
								className="company-card"
								key={company}
								to={`/viec-lam?keyword=${encodeURIComponent(company)}`}
							>
								<BriefcaseBusiness size={20} />
								{company}
							</Link>
						))}
					</div>
				</div>
			</section>
			<section className="section">
				<div className="container">
					<div className="section-head">
						<div>
							<h2>Ngành nghề nổi bật</h2>
							<p>Khám phá các cơ hội theo lĩnh vực bạn quan tâm.</p>
						</div>
						<Link className="button" to="/viec-lam">
							Xem tất cả <ArrowRight size={16} />
						</Link>
					</div>
					<div className="category-grid">
						{categories.length ?
							categories.map(([name, count], index) => {
								const Icon = icons[index % icons.length];
								return (
									<Link
										className="category-card"
										key={name}
										to={`/viec-lam?keyword=${encodeURIComponent(name)}`}
									>
										<span className="category-icon">
											<Icon size={21} />
										</span>
										<span>
											<h3>{name}</h3>
											<p>{count} tin đang tuyển</p>
										</span>
									</Link>
								);
							})
						:	<div className="empty">Chưa có dữ liệu ngành nghề.</div>}
					</div>
				</div>
			</section>
			<section className="section" style={{ background: "var(--surface)" }}>
				<div className="container">
					<div className="section-head">
						<div>
							<h2>Việc làm mới nhất</h2>
							<p>Những tin tuyển dụng vừa được cập nhật.</p>
						</div>
						<Link className="button" to="/viec-lam">
							Xem tất cả <ArrowRight size={16} />
						</Link>
					</div>
					{loading ?
						<div className="empty" style={{ marginTop: 28 }}>
							Đang tải việc làm...
						</div>
					: jobs.length ?
						<div className="job-grid">
							{jobs.map((job) => (
								<JobCard key={job._id} job={job} />
							))}
						</div>
					:	<div className="empty" style={{ marginTop: 28 }}>
							Không thể tải việc làm. Hãy kiểm tra kết nối API.
						</div>
					}
				</div>
			</section>
			<section className="section">
				<div className="container">
					<div
						className="panel"
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3,1fr)",
							padding: 28,
							textAlign: "center",
							gap: 16,
						}}
					>
						<div>
							<strong style={{ fontSize: 28 }}>
								{total.toLocaleString("vi-VN")}
							</strong>
							<p className="muted">Việc làm</p>
						</div>
						<div>
							<strong style={{ fontSize: 28 }}>{categories.length}</strong>
							<p className="muted">Nhóm ngành</p>
						</div>
						<div>
							<strong style={{ fontSize: 28 }}>24/7</strong>
							<p className="muted">Hỗ trợ tìm việc</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
