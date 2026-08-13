import { Link } from "react-router-dom";
export function Footer() {
	return (
		<footer className="site-footer">
			<div className="container footer-inner">
				<p>
					© {new Date().getFullYear()} Jinder — Kết nối đúng việc, đúng người.
				</p>
				<div className="footer-links">
					<Link to="/viec-lam">Tìm việc làm</Link>
					<Link to="/nha-tuyen-dung">Đăng tin tuyển dụng</Link>
					<Link to="/ho-so">Hồ sơ của tôi</Link>
				</div>
			</div>
		</footer>
	);
}
