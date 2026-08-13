import { Bookmark, Mail, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";
export default function Profile() {
	const user = JSON.parse(localStorage.getItem("vietot.user") || "null");
	if (!user)
		return (
			<div className="container page auth" style={{ textAlign: "center" }}>
				<h1 className="title">Bạn chưa đăng nhập</h1>
				<p className="muted">
					Đăng nhập để xem việc làm đã lưu và hồ sơ ứng tuyển.
				</p>
				<div
					style={{
						display: "flex",
						gap: 10,
						justifyContent: "center",
						marginTop: 24,
					}}
				>
					<Link className="button primary" to="/dang-nhap">
						Đăng nhập
					</Link>
					<Link className="button" to="/dang-ky">
						Đăng ký
					</Link>
				</div>
			</div>
		);
	return (
		<div className="container page">
			<h1 className="title">Hồ sơ của tôi</h1>
			<section className="panel profile-card" style={{ marginTop: 26 }}>
				<span className="avatar">
					<User size={25} />
				</span>
				<div>
					<h2 style={{ margin: 0 }}>{user.name}</h2>
					<p className="muted">
						<Mail size={15} style={{ verticalAlign: "middle" }} /> {user.email}{" "}
						{user.phone && (
							<>
								<Phone
									size={15}
									style={{ marginLeft: 13, verticalAlign: "middle" }}
								/>{" "}
								{user.phone}
							</>
						)}
					</p>
				</div>
				<div className="stats">
					<div>
						<strong>0</strong>
						<small>Việc đã lưu</small>
					</div>
					<div>
						<strong>0</strong>
						<small>Đã ứng tuyển</small>
					</div>
				</div>
			</section>
			<div className="tabs">
				<button className="active">
					<Bookmark size={15} /> Việc đã lưu
				</button>
				<button>Đã ứng tuyển</button>
			</div>
			<div className="empty">
				Bạn chưa lưu việc làm nào.
				<br />
				<Link className="button" style={{ marginTop: 15 }} to="/viec-lam">
					Khám phá việc làm
				</Link>
			</div>
		</div>
	);
}
