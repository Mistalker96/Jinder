import { BriefcaseBusiness, GraduationCap, Heart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getSession } from "../lib/session";

type Candidate = {
	_id: string;
	fullName: string;
	targetPosition: string;
	skills: string[];
	experience: string;
	education: string;
	user: { username: string };
};
export default function CandidateMatch() {
	const [candidates, setCandidates] = useState<Candidate[]>([]),
		[index, setIndex] = useState(0);
	const [message, setMessage] = useState("");
	useEffect(() => {
		const controller = new AbortController();
		const session = getSession();
		fetch(`${import.meta.env.VITE_API_URL}/employees/profiles`, {
			headers: { Authorization: `Bearer ${session?.token}` },
			signal: controller.signal,
		})
			.then((response) => response.json())
			.then((result) => setCandidates(result.data || []))
			.catch((error) => {
				if (error.name !== "AbortError") setCandidates([]);
			});
		return () => controller.abort();
	}, []);
	const candidate = candidates[index];
	const contact = async () => {
		if (!candidate) return;
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/employees/profiles/${candidate._id}/contact`,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${getSession()?.token || ""}` },
			},
		);
		const result = await response.json();
		setMessage(
			result.message ||
				(response.ok ? "Đã gửi thông báo liên hệ" : "Không thể liên hệ"),
		);
		if (response.ok) setIndex((value) => value + 1);
	};
	return (
		<div className="container page">
			<span className="eyebrow">JINDER RECRUIT</span>
			<h1 className="title">Quẹt để khám phá ứng viên</h1>
			<p className="muted">
				Bỏ qua hoặc lưu lại ứng viên phù hợp cho vị trí đang tuyển.
			</p>
			{message && (
				<p className="muted" role="status">
					{message}
				</p>
			)}
			<div className="match-card panel">
				{candidate ?
					<>
						<div
							className="match-visual profile-editor-avatar"
							aria-label="Ảnh đại diện ứng viên"
						>
							{candidate.fullName
								.split(" ")
								.map((item) => item[0])
								.slice(-2)
								.join("")}
						</div>
						<h2>{candidate.fullName}</h2>
						<p className="muted">{candidate.targetPosition}</p>
						<p>{candidate.experience || "Kinh nghiệm đang cập nhật"}</p>
						<div className="match-highlights">
							<div>
								<GraduationCap size={19} />
								<span>
									Bằng cấp chuyên môn
									<strong>{candidate.education || "Đang cập nhật"}</strong>
								</span>
							</div>
							<div>
								<BriefcaseBusiness size={19} />
								<span>
									Kinh nghiệm
									<strong>{candidate.experience || "Đang cập nhật"}</strong>
								</span>
							</div>
						</div>
						<div className="tags">
							{candidate.skills.slice(0, 4).map((skill) => (
								<span className="tag" key={skill}>
									{skill}
								</span>
							))}
						</div>
						<div className="match-actions">
							<button
								className="match-button skip"
								onClick={() => setIndex((value) => value + 1)}
							>
								<X />
							</button>
							<button className="match-button like" onClick={contact}>
								<Heart />
							</button>
						</div>
					</>
				:	<div className="empty">Chưa có hồ sơ ứng viên để xem.</div>}
			</div>
		</div>
	);
}
