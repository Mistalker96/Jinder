import { useEffect, useState } from "react";
import { getSession, saveSession } from "../lib/session";
import { useNavigate } from "react-router-dom";
export default function Account() {
	const session = getSession()!;
	const navigate = useNavigate();
	const [form, setForm] = useState({
			fullName: session.user.fullName || "",
			email: session.user.email || "",
			phone: session.user.phone || "",
			address: session.user.address || "",
			avatar: session.user.avatar || "",
		}),
		[message, setMessage] = useState("");
	const [details, setDetails] = useState({
		targetPosition: "", experience: "", education: "", skills: "", expectedSalary: "", cvUrl: "",
		companyName: session.user.fullName || "", industry: "", employeeCount: "", jobCategories: "",
		companyDescription: "", website: "",
	});
	useEffect(() => {
		if (session.user.role === "admin") return;
		const controller = new AbortController();
		const endpoint = session.user.role === "employee" ? "/employees/cv" : "/recruiters/profile";
		fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, { headers: { Authorization: `Bearer ${session.token}` }, signal: controller.signal })
			.then((response) => response.json())
			.then(({ data }) => { if (data) setDetails((current) => ({ ...current, ...data, skills: data.skills?.join(", ") || "", jobCategories: data.jobCategories?.join(", ") || "", expectedSalary: data.expectedSalary?.toString() || "", employeeCount: data.employeeCount?.toString() || "" })); })
			.catch((error) => { if (error.name !== "AbortError") setMessage("Không thể tải thông tin chi tiết"); });
		return () => controller.abort();
	}, [session.token, session.user.role]);
	const initials = (form.fullName || session.user.username)
		.split(" ")
		.filter(Boolean)
		.map((value) => value[0])
		.slice(-2)
		.join("")
		.toUpperCase();
	const upload = (file?: File) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () =>
			setForm((current) => ({ ...current, avatar: String(reader.result) }));
		reader.readAsDataURL(file);
	};
	const uploadCv = (file?: File) => {
		if (!file) return;
		if (file.size > 1024 * 1024) return setMessage("CV không được vượt quá 1 MB");
		const reader = new FileReader();
		reader.onload = () => setDetails((current) => ({ ...current, cvUrl: String(reader.result) }));
		reader.readAsDataURL(file);
	};
	const dashboard =
		session.user.role === "employee" ? "/ho-so"
		: session.user.role === "recruiter" ? "/nha-tuyen-dung"
		: "/quan-tri";
	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.token}`,
			},
			body: JSON.stringify(form),
		});
		const data = await response.json();
		if (!response.ok) return setMessage(data.message || "Không thể lưu");
		if (session.user.role !== "admin") {
			const employee = session.user.role === "employee";
			const profileBody = employee ? {
				fullName: form.fullName, phone: form.phone, targetPosition: details.targetPosition, experience: details.experience,
				education: details.education, skills: details.skills.split(",").map((item) => item.trim()).filter(Boolean),
				expectedSalary: details.expectedSalary || undefined, cvUrl: details.cvUrl,
			} : {
				companyName: details.companyName, industry: details.industry, employeeCount: details.employeeCount,
				companyDescription: details.companyDescription, website: details.website,
				jobCategories: details.jobCategories.split(",").map((item) => item.trim()).filter(Boolean),
			};
			const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}${employee ? "/employees/cv" : "/recruiters/profile"}`, {
				method: employee ? "POST" : "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` }, body: JSON.stringify(profileBody),
			});
			const profileResult = await profileResponse.json();
			if (!profileResponse.ok) return setMessage(profileResult.message || "Không thể lưu hồ sơ chi tiết");
		}
		saveSession(data);
		navigate(dashboard);
	};
	return (
		<div className="container page auth">
			<button className="button" onClick={() => navigate(dashboard)}>
				← Quay lại
			</button>
			<h1 className="title">Thông tin cá nhân</h1>
			<form className="panel form-card" onSubmit={submit}>
				<div className="profile-editor-avatar">
					{form.avatar ?
						<img src={form.avatar} alt="Ảnh đại diện" />
					:	initials}
				</div>
				<label className="button" style={{ width: "100%" }}>
					Tải ảnh đại diện
					<input
						type="file"
						accept="image/*"
						hidden
						onChange={(event) => upload(event.target.files?.[0])}
					/>
				</label>
				<Field
					label="Họ và tên"
					value={form.fullName}
					onChange={(value) => setForm({ ...form, fullName: value })}
				/>
				<Field label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
				<Field
					label="Số điện thoại"
					value={form.phone}
					onChange={(value) => setForm({ ...form, phone: value })}
				/>
				<Field
					label="Địa chỉ"
					value={form.address}
					onChange={(value) => setForm({ ...form, address: value })}
				/>
				{session.user.role === "employee" && <>
					<Field label="Vị trí mong muốn" value={details.targetPosition} onChange={(value) => setDetails({ ...details, targetPosition: value })} />
					<TextArea label="Kinh nghiệm làm việc" value={details.experience} onChange={(value) => setDetails({ ...details, experience: value })} />
					<TextArea label="Bằng cấp / học vấn" value={details.education} onChange={(value) => setDetails({ ...details, education: value })} />
					<Field label="Kỹ năng (phân cách bằng dấu phẩy)" value={details.skills} onChange={(value) => setDetails({ ...details, skills: value })} />
					<Field label="Mức lương mong muốn" value={details.expectedSalary} onChange={(value) => setDetails({ ...details, expectedSalary: value })} />
					<label className="button account-upload">Upload CV (PDF/DOC, tối đa 1 MB)<input type="file" accept=".pdf,.doc,.docx" hidden onChange={(event) => uploadCv(event.target.files?.[0])} /></label>
					{details.cvUrl && <p className="muted">Đã tải CV lên.</p>}
				</>}
				{session.user.role === "recruiter" && <>
					<Field label="Tên công ty" value={details.companyName} onChange={(value) => setDetails({ ...details, companyName: value })} />
					<Field label="Lĩnh vực" value={details.industry} onChange={(value) => setDetails({ ...details, industry: value })} />
					<Field label="Số lượng nhân viên" value={details.employeeCount} onChange={(value) => setDetails({ ...details, employeeCount: value })} />
					<Field label="Ngành nghề tuyển dụng (phân cách bằng dấu phẩy)" value={details.jobCategories} onChange={(value) => setDetails({ ...details, jobCategories: value })} />
					<TextArea label="Giới thiệu công ty" value={details.companyDescription} onChange={(value) => setDetails({ ...details, companyDescription: value })} />
					<Field label="Website công ty" value={details.website} onChange={(value) => setDetails({ ...details, website: value })} />
				</>}
				{message && <p className="muted">{message}</p>}
				<button
					className="button primary"
					style={{ width: "100%", marginTop: 18 }}
				>
					Lưu thay đổi
				</button>
			</form>
		</div>
	);
}
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
	return <div className="form-group"><label>{label}</label><textarea className="textarea" rows={4} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}
function Field({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="form-group">
			<label>{label}</label>
			<input
				className="input"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</div>
	);
}
