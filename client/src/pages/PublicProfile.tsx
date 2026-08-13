import { BriefcaseBusiness, MapPin, Star, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSession } from "../lib/session";

type PublicProfileData = {
	user: {
		_id: string;
		username: string;
		fullName: string;
		avatar?: string;
		role: "employee" | "recruiter";
		address?: string;
		email?: string;
		phone?: string;
		createdAt: string;
	};
	profile: null | {
		fullName?: string;
		targetPosition?: string;
		skills?: string[];
		experience?: string;
		education?: string;
		expectedSalary?: number;
		cvUrl?: string;
		companyName?: string;
		industry?: string;
		employeeCount?: number;
		jobCategories?: string[];
		companyDescription?: string;
		website?: string;
	};
	jobs: Array<{
		_id: string;
		job_title: string;
		company: string;
		city: string;
		job_type: string;
	}>;
	reviews?: EmployerReview[];
	myReview?: EmployerReview | null;
	ratingSummary?: RatingSummary;
};

type EmployerReview = {
	_id: string;
	reviewer: {
		_id: string;
		username: string;
		fullName?: string;
		avatar?: string;
	};
	overall: number;
	friendliness: number;
	environment: number;
	benefits: number;
	comment: string;
	updatedAt: string;
};

type RatingSummary = {
	count: number;
	overall: number;
	friendliness: number;
	environment: number;
	benefits: number;
};

type ReviewForm = Omit<EmployerReview, "_id" | "reviewer" | "updatedAt">;

const emptyReview: ReviewForm = {
	overall: 5,
	friendliness: 5,
	environment: 5,
	benefits: 5,
	comment: "",
};

export default function PublicProfile() {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const [data, setData] = useState<PublicProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [refreshKey, setRefreshKey] = useState(0);
	const [review, setReview] = useState<ReviewForm>(emptyReview);
	const [reviewMessage, setReviewMessage] = useState("");
	const [savingReview, setSavingReview] = useState(false);
	useEffect(() => {
		const controller = new AbortController();
		fetch(`${import.meta.env.VITE_API_URL}/profiles/${id}`, {
			headers: { Authorization: `Bearer ${getSession()?.token || ""}` },
			signal: controller.signal,
		})
			.then(async (response) => {
				const result = await response.json();
				if (!response.ok)
					throw new Error(result.message || "Không thể tải hồ sơ");
				setData(result.data);
				if (result.data.myReview) {
					const { overall, friendliness, environment, benefits, comment } =
						result.data.myReview;
					setReview({ overall, friendliness, environment, benefits, comment });
				}
			})
			.catch((reason) => {
				if (reason.name !== "AbortError") setError(reason.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [id, refreshKey]);
	const submitReview = async (event: React.FormEvent) => {
		event.preventDefault();
		setSavingReview(true);
		setReviewMessage("");
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/profiles/${id}/review`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${getSession()?.token || ""}`,
					},
					body: JSON.stringify(review),
				},
			);
			const result = await response.json();
			if (!response.ok)
				throw new Error(result.message || "Không thể gửi đánh giá");
			setReviewMessage("Đã lưu đánh giá của bạn.");
			setRefreshKey((value) => value + 1);
		} catch (reason) {
			setReviewMessage(
				reason instanceof Error ? reason.message : "Không thể gửi đánh giá",
			);
		} finally {
			setSavingReview(false);
		}
	};
	if (loading)
		return (
			<div className="container page">
				<div className="empty">Đang tải hồ sơ...</div>
			</div>
		);
	if (!data)
		return (
			<div className="container page">
				<div className="empty">{error || "Không tìm thấy hồ sơ."}</div>
			</div>
		);
	const { user, profile, jobs } = data;
	const name =
		profile?.fullName || profile?.companyName || user.fullName || user.username;
	const safeWebsite =
		profile?.website && /^https?:\/\//i.test(profile.website) ?
			profile.website
		:	"";
	return (
		<div className="container page public-profile-page">
			<button className="button ghost" onClick={() => navigate(-1)}>
				← Quay lại
			</button>
			<section className="panel public-profile-hero">
				<div className="public-profile-avatar">
					{user.avatar ?
						<img src={user.avatar} alt={`Ảnh của ${name}`} />
					:	<UserRound size={36} />}
				</div>
				<div>
					<span className="eyebrow">
						{user.role === "employee" ? "ỨNG VIÊN" : "NHÀ TUYỂN DỤNG"}
					</span>
					<h1>{name}</h1>
					<p className="muted">
						@{user.username}
						{user.address ? ` · ${user.address}` : ""}
					</p>
				</div>
			</section>
			{user.role === "employee" && profile ?
				<div className="public-profile-grid">
					<section className="panel public-profile-section">
						<h2>Giới thiệu chuyên môn</h2>
						<p>
							<strong>Vị trí mong muốn:</strong>{" "}
							{profile.targetPosition || "Đang cập nhật"}
						</p>
						<p>{profile.experience || "Kinh nghiệm đang cập nhật."}</p>
						{profile.expectedSalary !== undefined && (
							<p>
								<strong>Mức lương mong muốn:</strong>{" "}
								{profile.expectedSalary.toLocaleString("vi-VN")}
							</p>
						)}
					</section>
					<section className="panel public-profile-section">
						<h2>Học vấn và kỹ năng</h2>
						<p>{profile.education || "Học vấn đang cập nhật."}</p>
						<div className="tags">
							{(profile.skills || []).map((skill) => (
								<span className="tag primary" key={skill}>
									{skill}
								</span>
							))}
						</div>
					</section>
					<section className="panel public-profile-section">
						<h2>Thông tin liên hệ</h2>
						<p>
							{user.email ?
								<a href={`mailto:${user.email}`}>{user.email}</a>
							:	"Email chưa cập nhật"}
						</p>
						<p>
							{user.phone ?
								<a href={`tel:${user.phone}`}>{user.phone}</a>
							:	"Số điện thoại chưa cập nhật"}
						</p>
						<p>{user.address || "Địa chỉ chưa cập nhật"}</p>
						{profile.cvUrl && (
							<a
								className="button primary"
								href={profile.cvUrl}
								download={`CV-${user.username}`}
							>
								Tải CV ứng viên
							</a>
						)}
					</section>
				</div>
			:	<div>
					<section className="public-profile-section">
						<h2>Vị trí đang tuyển</h2>
						{profile && (
							<div className="panel public-profile-section">
								<h2>{profile.companyName || name}</h2>
								<p>
									{profile.companyDescription ||
										"Thông tin công ty đang được cập nhật."}
								</p>
								<p>
									<strong>Lĩnh vực:</strong>{" "}
									{profile.industry || "Đang cập nhật"} ·{" "}
									<strong>Quy mô:</strong>{" "}
									{profile.employeeCount ?
										`${profile.employeeCount} nhân viên`
									:	"Đang cập nhật"}
								</p>
								<p>
									<strong>Liên hệ:</strong>{" "}
									{user.email || "Email chưa cập nhật"}
									{user.phone ? ` · ${user.phone}` : ""}
								</p>
								{safeWebsite && (
									<p>
										<a href={safeWebsite} target="_blank" rel="noreferrer">
											Website công ty
										</a>
									</p>
								)}
								<div className="tags">
									{(profile.jobCategories || []).map((item) => (
										<span className="tag primary" key={item}>
											{item}
										</span>
									))}
								</div>
							</div>
						)}
						{jobs.length ?
							<div className="job-list">
								{jobs.map((job) => (
									<Link
										className="panel public-profile-job"
										to={`/viec-lam/${job._id}`}
										key={job._id}
									>
										<BriefcaseBusiness size={20} />
										<span>
											<strong>{job.job_title}</strong>
											<small>
												<MapPin size={13} /> {job.city} · {job.job_type}
											</small>
										</span>
									</Link>
								))}
							</div>
						:	<div className="empty">Nhà tuyển dụng chưa có tin tuyển dụng.</div>
						}
					</section>
					<EmployerReviews
						reviews={data.reviews || []}
						summary={
							data.ratingSummary || {
								count: 0,
								overall: 0,
								friendliness: 0,
								environment: 0,
								benefits: 0,
							}
						}
						review={review}
						setReview={setReview}
						onSubmit={submitReview}
						message={reviewMessage}
						saving={savingReview}
						isUpdate={Boolean(data.myReview)}
					/>
				</div>
			}
		</div>
	);
}

function Stars({
	value,
	onChange,
}: {
	value: number;
	onChange?: (value: number) => void;
}) {
	return (
		<div className="review-stars" aria-label={`${value} trên 5 sao`}>
			{[1, 2, 3, 4, 5].map((score) =>
				onChange ?
					<button
						type="button"
						key={score}
						onClick={() => onChange(score)}
						aria-label={`${score} sao`}
					>
						<Star size={20} fill={score <= value ? "currentColor" : "none"} />
					</button>
				:	<Star
						key={score}
						size={18}
						fill={score <= Math.round(value) ? "currentColor" : "none"}
					/>,
			)}
		</div>
	);
}

function EmployerReviews({
	reviews,
	summary,
	review,
	setReview,
	onSubmit,
	message,
	saving,
	isUpdate,
}: {
	reviews: EmployerReview[];
	summary: RatingSummary;
	review: ReviewForm;
	setReview: React.Dispatch<React.SetStateAction<ReviewForm>>;
	onSubmit: (event: React.FormEvent) => void;
	message: string;
	saving: boolean;
	isUpdate: boolean;
}) {
	const criteria: Array<
		[
			keyof Pick<
				ReviewForm,
				"overall" | "friendliness" | "environment" | "benefits"
			>,
			string,
		]
	> = [
		["overall", "Đánh giá chung"],
		["friendliness", "Thân thiện"],
		["environment", "Môi trường"],
		["benefits", "Đãi ngộ"],
	];
	return (
		<section className="panel public-profile-section employer-reviews">
			<h2>Đánh giá từ ứng viên</h2>
			<div className="review-summary">
				<div>
					<strong>{summary.overall.toFixed(1)}</strong>
					<Stars value={summary.overall} />
					<span>{summary.count} đánh giá</span>
				</div>
				<ul>
					<li>
						Thân thiện <strong>{summary.friendliness.toFixed(1)}/5</strong>
					</li>
					<li>
						Môi trường <strong>{summary.environment.toFixed(1)}/5</strong>
					</li>
					<li>
						Đãi ngộ <strong>{summary.benefits.toFixed(1)}/5</strong>
					</li>
				</ul>
			</div>
			<form className="review-form" onSubmit={onSubmit}>
				<h3>{isUpdate ? "Cập nhật đánh giá của bạn" : "Viết đánh giá"}</h3>
				{criteria.map(([key, label]) => (
					<div className="review-criterion" key={key}>
						<label>{label}</label>
						<Stars
							value={review[key]}
							onChange={(value) =>
								setReview((current) => ({ ...current, [key]: value }))
							}
						/>
					</div>
				))}
				<textarea
					className="textarea"
					rows={4}
					maxLength={2000}
					required
					placeholder="Chia sẻ trải nghiệm của bạn..."
					value={review.comment}
					onChange={(event) =>
						setReview((current) => ({
							...current,
							comment: event.target.value,
						}))
					}
				/>
				<button className="button primary" disabled={saving}>
					{saving ?
						"Đang lưu..."
					: isUpdate ?
						"Cập nhật đánh giá"
					:	"Gửi đánh giá"}
				</button>
				{message && <p className="muted">{message}</p>}
			</form>
			<div className="review-list">
				{reviews.map((item) => (
					<article className="review-item" key={item._id}>
						<div className="review-item-head">
							<strong>
								{item.reviewer.fullName || item.reviewer.username}
							</strong>
							<Stars value={item.overall} />
						</div>
						<small>
							Thân thiện {item.friendliness}/5 · Môi trường {item.environment}/5
							· Đãi ngộ {item.benefits}/5
						</small>
						<p>{item.comment}</p>
					</article>
				))}
				{!reviews.length && <div className="empty">Chưa có đánh giá nào.</div>}
			</div>
		</section>
	);
}
