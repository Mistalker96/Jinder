import { useState } from "react";
export default function Employer() {
	const [posted, setPosted] = useState(false);
	return (
		<div className="container page">
			<span className="eyebrow">DÀNH CHO NHÀ TUYỂN DỤNG</span>
			<h1 className="title">Tìm ứng viên phù hợp nhanh hơn</h1>
			<p className="muted">
				Đăng tin tuyển dụng và tiếp cận ứng viên tiềm năng chỉ trong vài phút.
			</p>
			<div className="tabs">
				<button
					className={!posted ? "active" : ""}
					onClick={() => setPosted(false)}
				>
					Đăng tin mới
				</button>
				<button
					className={posted ? "active" : ""}
					onClick={() => setPosted(true)}
				>
					Tin đã đăng
				</button>
			</div>
			{posted ?
				<div className="empty">Bạn chưa đăng tin tuyển dụng nào.</div>
			:	<form
					className="panel employer-form"
					onSubmit={(e) => {
						e.preventDefault();
						setPosted(true);
					}}
				>
					<div className="form-grid">
						<Field label="Tên công việc" required />
						<Field label="Tên công ty" required />
						<Field label="Địa điểm" required />
						<Field label="Ngành nghề" required />
						<Field label="Loại hình" required />
						<Field label="Kinh nghiệm" required />
					</div>
					<div className="form-grid">
						<Field label="Lương tối thiểu (triệu)" type="number" />
						<Field label="Lương tối đa (triệu)" type="number" />
					</div>
					<Field label="Giới thiệu ngắn" area required />
					<Field label="Mô tả công việc" area required />
					<Field label="Yêu cầu ứng viên" area required />
					<button className="button primary" style={{ marginTop: 20 }}>
						Đăng tin tuyển dụng
					</button>
				</form>
			}
		</div>
	);
}
function Field({
	label,
	area,
	type = "text",
	required = false,
}: {
	label: string;
	area?: boolean;
	type?: string;
	required?: boolean;
}) {
	return (
		<div className="form-group">
			<label>{label}</label>
			{area ?
				<textarea className="textarea" rows={4} required={required} />
			:	<input className="input" type={type} required={required} />}
		</div>
	);
}
