import {
	Banknote,
	Bookmark,
	BriefcaseBusiness,
	Building2,
	Clock3,
	MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSession } from "../lib/session";
import { JobService } from "../services/jobService";
import type { Job } from "../types/job";
const lines = (value: string, fallback: string[]) =>
	value ?
		value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean)
	:	fallback;
export default function JobDetail() {
	const { id = "" } = useParams();
	const [job, setJob] = useState<Job | null>(null),
		[loading, setLoading] = useState(true),
		[saved, setSaved] = useState(false);
	const [applyMessage, setApplyMessage] = useState("");
	const [applying, setApplying] = useState(false);
	const navigate = useNavigate();
	useEffect(() => {
		const controller = new AbortController();
		JobService.getJobById(id, controller.signal)
			.then((result) => setJob(result.data))
			.catch((error) => {
				if (error.name !== "AbortError") setJob(null);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [id]);
	if (loading)
		return (
			<div className="container page">
				<div className="empty">Đang tải tin tuyển dụng...</div>
			</div>
		);
	if (!job)
		return (
			<div className="container page">
				<div className="empty">
					Không tìm thấy tin tuyển dụng.{" "}
					<Link to="/viec-lam">Quay lại danh sách</Link>
				</div>
			</div>
		);
	const skills = lines(job.skills, [job.job_fields]);
	const save = async () => {
		if (getSession()?.user.role !== "employee") return navigate("/dang-nhap");
		await JobService.saveJob(job._id);
		setSaved(true);
	};
	const apply = async () => {
		if (getSession()?.user.role !== "employee") return navigate("/dang-nhap");
		setApplying(true);
		try {
			const result = await JobService.apply(job._id);
			setApplyMessage(result.message);
		} catch (error) {
			setApplyMessage(
				error instanceof Error ? error.message : "Không thể ứng tuyển",
			);
		} finally {
			setApplying(false);
		}
	};
	return (
		<div className="container page">
			<Link className="muted" to="/viec-lam">
				← Quay lại danh sách việc làm
			</Link>
			<div className="detail-grid job-detail-layout">
				<main>
					<section className="panel job-summary-card">
						<div className="job-logo large">
							{job.company?.slice(0, 2).toUpperCase() ||
								job.job_title.charAt(0)}
						</div>
						<div>
							<h1>{job.job_title}</h1>
							<p>{job.company || "Nhà tuyển dụng"}</p>
						</div>
						<div className="detail-meta">
							<span>
								<Banknote size={17} />
								{job.salary}
							</span>
							<span>
								<MapPin size={17} />
								{job.city}
							</span>
							<span>
								<BriefcaseBusiness size={17} />
								{job.experience}
							</span>
							<span>
								<Clock3 size={17} />
								Đăng gần đây
							</span>
						</div>
						<div className="tags detail-tags">
							<span className="tag primary">{job.job_type}</span>
							<span className="tag">{job.job_fields}</span>
							{skills.slice(0, 5).map((skill) => (
								<span className="tag" key={skill}>
									{skill}
								</span>
							))}
						</div>
					</section>
					<section className="panel detail-card">
						<DetailSection
							title="Mô tả công việc"
							items={[
								`Phát triển và tối ưu công việc tại ${job.company || "doanh nghiệp"}.`,
								`Phối hợp cùng đội ngũ để hoàn thành mục tiêu chuyên môn.`,
								`Tham gia xây dựng quy trình và cải thiện chất lượng sản phẩm.`,
							]}
						/>
						<DetailSection
							title="Yêu cầu ứng viên"
							items={[
								`Có kinh nghiệm ${job.experience || "phù hợp"} với vị trí ứng tuyển.`,
								`Có kiến thức hoặc kỹ năng: ${skills.join(", ")}.`,
								"Chủ động, trách nhiệm và có kỹ năng làm việc nhóm.",
							]}
						/>
						<DetailSection
							title="Phúc lợi"
							items={[
								`Thu nhập ${job.salary} theo năng lực.`,
								"Môi trường làm việc chuyên nghiệp, cơ hội phát triển.",
								"Các chế độ bảo hiểm và phúc lợi theo chính sách công ty.",
							]}
						/>
					</section>
				</main>
				<aside>
					<section className="panel apply-card">
						<p className="muted">
							Cơ hội phù hợp cho ứng viên muốn phát triển sự nghiệp trong môi
							trường chuyên nghiệp.
						</p>
						<button
							className="button primary"
							style={{ width: "100%" }}
							onClick={apply}
							disabled={applying}
						>
							{applying ? "Đang ứng tuyển..." : "Ứng tuyển ngay"}
						</button>
						{applyMessage && (
							<p className="muted" role="status">
								{applyMessage}
							</p>
						)}
						<button
							className="button"
							style={{ width: "100%", marginTop: 10 }}
							onClick={save}
						>
							<Bookmark size={17} /> {saved ? "Đã lưu" : "Lưu tin này"}
						</button>
					</section>
					<section className="panel company-info">
						<h2>
							<Building2 size={19} /> Về công ty
						</h2>
						<Info label="Tên công ty" value={job.company || "Đang cập nhật"} />
						<Info label="Lĩnh vực" value={job.job_fields} />
						<Info label="Quy mô" value="Đang cập nhật" />
						<Info label="Địa điểm" value={job.city} />
					</section>
				</aside>
			</div>
		</div>
	);
}
function DetailSection({ title, items }: { title: string; items: string[] }) {
	return (
		<section className="detail-section">
			<h2>{title}</h2>
			<ul>
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</section>
	);
}
function Info({ label, value }: { label: string; value: string }) {
	return (
		<p>
			<span>{label}</span>
			<strong>{value}</strong>
		</p>
	);
}
