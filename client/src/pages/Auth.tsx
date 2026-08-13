import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService, type AccountRole } from "../services/authService";
import { saveSession } from "../lib/session";
export function AuthPage({ mode }: { mode: "login" | "register" }) {
	const register = mode === "register";
	const navigate = useNavigate();
	const [role, setRole] = useState<Exclude<AccountRole, "admin">>("employee");
	const [username, setUsername] = useState(""),
		[fullName, setFullName] = useState(""),
		[email, setEmail] = useState(""),
		[phone, setPhone] = useState(""),
		[address, setAddress] = useState(""),
		[targetPosition, setTargetPosition] = useState(""),
		[experience, setExperience] = useState(""),
		[education, setEducation] = useState(""),
		[industry, setIndustry] = useState(""),
		[employeeCount, setEmployeeCount] = useState(""),
		[jobCategories, setJobCategories] = useState(""),
		[password, setPassword] = useState(""),
		[error, setError] = useState(""),
		[saving, setSaving] = useState(false);
	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");
		setSaving(true);
		try {
			const session =
				register ?
					await AuthService.register({ username, password, fullName, email, phone, address, role, targetPosition, experience, education, companyName: fullName, industry, employeeCount, jobCategories })
				:	await AuthService.login(username, password);
			saveSession(session);
			navigate(
				session.user.role === "employee" ? "/ho-so"
				: session.user.role === "recruiter" ? "/nha-tuyen-dung"
				: "/quan-tri",
			);
		} catch (requestError) {
			setError(
				requestError instanceof Error ?
					requestError.message
				:	"Không thể xử lý yêu cầu",
			);
		} finally {
			setSaving(false);
		}
	};
	return (
		<div className="container page auth">
			<h1 className="title">
				{register ? "Tạo tài khoản" : "Đăng nhập Jinder"}
			</h1>
			<p className="muted">
				{register ?
					"Chọn loại tài khoản để bắt đầu."
				:	"Đăng nhập với tài khoản ứng viên hoặc nhà tuyển dụng."}
			</p>
			<form className="panel form-card" onSubmit={submit}>
				<div className="tabs">
					<button
						type="button"
						className={role === "employee" ? "active" : ""}
						onClick={() => setRole("employee")}
					>
						Người dùng
					</button>
					<button
						type="button"
						className={role === "recruiter" ? "active" : ""}
						onClick={() => setRole("recruiter")}
					>
						Nhà tuyển dụng
					</button>
				</div>
				{register && (
					<>
					<div className="form-group">
						<label>Họ và tên / tên công ty</label>
						<input
							className="input"
							required
							value={fullName}
							onChange={(event) => setFullName(event.target.value)}
						/>
					</div>
					<RegisterField label="Email" type="email" value={email} onChange={setEmail} required />
					<RegisterField label="Số điện thoại liên hệ" type="tel" value={phone} onChange={setPhone} required />
					<RegisterField label="Địa chỉ" value={address} onChange={setAddress} required />
					{role === "employee" ? <>
						<RegisterField label="Vị trí mong muốn" value={targetPosition} onChange={setTargetPosition} required />
						<RegisterField label="Kinh nghiệm làm việc" value={experience} onChange={setExperience} />
						<RegisterField label="Bằng cấp / học vấn" value={education} onChange={setEducation} />
					</> : <>
						<RegisterField label="Lĩnh vực công ty" value={industry} onChange={setIndustry} required />
						<RegisterField label="Số lượng nhân viên" type="number" value={employeeCount} onChange={setEmployeeCount} required />
						<RegisterField label="Ngành nghề tuyển dụng (phân cách bằng dấu phẩy)" value={jobCategories} onChange={setJobCategories} />
					</>}
					</>
				)}
				<div className="form-group">
					<label>ID đăng nhập</label>
					<input
						className="input"
						required
						autoComplete="username"
						placeholder={
							role === "employee" ? "Ví dụ: employ1" : "Ví dụ: recruit1"
						}
						value={username}
						onChange={(event) => setUsername(event.target.value)}
					/>
				</div>
				<div className="form-group">
					<label>Mật khẩu</label>
					<input
						className="input"
						type="password"
						minLength={6}
						required
						autoComplete={register ? "new-password" : "current-password"}
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</div>
				{error && (
					<p role="alert" style={{ color: "#c73434", fontSize: 14 }}>
						{error}
					</p>
				)}
				<button
					className="button primary"
					disabled={saving}
					style={{ width: "100%", marginTop: 22 }}
				>
					{saving ?
						"Đang xử lý..."
					: register ?
						`Đăng ký ${role === "employee" ? "người dùng" : "nhà tuyển dụng"}`
					:	"Đăng nhập"}
				</button>
				<p className="muted" style={{ textAlign: "center", fontSize: 14 }}>
					{register ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
					<Link
						to={register ? "/dang-nhap" : "/dang-ky"}
						style={{ color: "var(--primary)", fontWeight: 600 }}
					>
						{register ? "Đăng nhập" : "Đăng ký ngay"}
					</Link>
				</p>
				{!register && (
					<p className="muted" style={{ fontSize: 12, textAlign: "center" }}>
						Tài khoản admin có thể đăng nhập ở cả hai mục.
					</p>
				)}
			</form>
		</div>
	);
}

function RegisterField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
	return <div className="form-group"><label>{label}</label><input className="input" type={type} min={type === "number" ? 1 : undefined} required={required} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}
