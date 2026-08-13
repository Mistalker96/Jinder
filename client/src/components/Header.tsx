import { Bell, Menu, Moon, Sun } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearSession, getSession } from "../lib/session";
import {
	NotificationService,
	type Notification,
} from "../services/notificationService";
export function Header() {
	const [dark, setDark] = useState(() =>
		document.documentElement.classList.contains("dark"),
	);
	const [open, setOpen] = useState(false);
	const [dropdown, setDropdown] = useState<"jobs" | "companies" | null>(null);
	const [session, setSession] = useState(getSession());
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unread, setUnread] = useState(0);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const navigate = useNavigate();
	useEffect(() => {
		const refresh = () => setSession(getSession());
		window.addEventListener("jinder-auth-change", refresh);
		return () => window.removeEventListener("jinder-auth-change", refresh);
	}, []);
	useEffect(() => {
		if (!session) return;
		const controller = new AbortController();
		const load = () =>
			NotificationService.get(controller.signal)
				.then((result) => {
					setNotifications(result.data);
					setUnread(result.unread);
				})
				.catch((error) => {
					if (error.name !== "AbortError") setNotifications([]);
				});
		load();
		const timer = window.setInterval(load, 30000);
		return () => {
			controller.abort();
			window.clearInterval(timer);
		};
	}, [session]);
	const toggleNotifications = () => {
		const next = !notificationsOpen;
		setNotificationsOpen(next);
		if (next && unread) {
			setUnread(0);
			setNotifications((items) =>
				items.map((item) => ({ ...item, read: true })),
			);
			NotificationService.markRead().catch(() => undefined);
		}
	};
	const toggleTheme = () => {
		document.documentElement.classList.toggle("dark");
		setDark((value) => !value);
	};
	const links = [
		["/viec-lam", "Việc làm"],
		["/nha-tuyen-dung", "Công ty"],
	] as const;
	return (
		<header className="site-header">
			<div className="container header-inner">
				<NavLink to="/" className="brand">
					<span className="brand-mark" aria-hidden="true">
						J
					</span>
					Jinder
				</NavLink>
				<nav className="nav">
					<div className="nav-dropdown">
						<button
							className="nav-trigger"
							onClick={() => setDropdown(dropdown === "jobs" ? null : "jobs")}
						>
							Việc làm
						</button>
						{dropdown === "jobs" && (
							<div className="mega-menu three-col">
								<div>
									<strong>Theo ngành nghề</strong>
									{[
										"Công nghệ",
										"Kế toán",
										"Marketing",
										"Nhân sự",
										"Thiết kế",
										"Bán hàng",
										"Giáo dục",
									].map((item) => (
										<NavLink
											key={item}
											onClick={() => setDropdown(null)}
											to={`/viec-lam?field=${item}`}
										>
											{item}
										</NavLink>
									))}
								</div>
								<div>
									<strong>Theo địa điểm</strong>
									{[
										"Hồ Chí Minh",
										"Hà Nội",
										"Đà Nẵng",
										"Cần Thơ",
										"Bình Dương",
										"Hải Phòng",
									].map((item) => (
										<NavLink
											key={item}
											onClick={() => setDropdown(null)}
											to={`/viec-lam?city=${item}`}
										>
											{item}
										</NavLink>
									))}
								</div>
								<div>
									<strong>Theo nhu cầu</strong>
									{[
										"Part time",
										"Toàn thời gian",
										"Thực tập",
										"Remote",
										"Freelance",
										"Mới tốt nghiệp",
									].map((item) => (
										<NavLink
											key={item}
											onClick={() => setDropdown(null)}
											to={`/viec-lam?type=${item}`}
										>
											{item === "Toàn thời gian" ? "Full time" : item}
										</NavLink>
									))}
								</div>
							</div>
						)}
					</div>
					<div className="nav-dropdown">
						<button
							className="nav-trigger"
							onClick={() =>
								setDropdown(dropdown === "companies" ? null : "companies")
							}
						>
							Công ty
						</button>
						{dropdown === "companies" && (
							<div className="mega-menu">
								<div>
									<strong>Theo lĩnh vực</strong>
									{[
										"Y tế",
										"Sản xuất",
										"Công nghệ",
										"Tài chính",
										"Thương mại điện tử",
										"Logistics",
										"Bất động sản",
										"Truyền thông",
									].map((item) => (
										<NavLink
											key={item}
											onClick={() => setDropdown(null)}
											to={`/viec-lam?field=${item}`}
										>
											{item}
										</NavLink>
									))}
								</div>
							</div>
						)}
					</div>
					{session?.user.role === "employee" && (
						<NavLink to="/jinder-match">Jinder Match</NavLink>
					)}
					{session?.user.role === "recruiter" && (
						<NavLink to="/ung-vien-match">Ứng viên Match</NavLink>
					)}
				</nav>
				<div className="header-actions">
					{session && (
						<div className="notification-wrap">
							<button
								className="icon-button notification-button"
								onClick={toggleNotifications}
								aria-label="Thông báo"
								aria-expanded={notificationsOpen}
							>
								<Bell size={19} />
								{unread > 0 && (
									<span className="notification-badge">
										{unread > 9 ? "9+" : unread}
									</span>
								)}
							</button>
							{notificationsOpen && (
								<div className="notification-panel">
									<strong>Thông báo</strong>
									{notifications.length ?
										notifications.map((item) => (
											<button
												key={item._id}
												className="notification-item"
												onClick={() => {
													setNotificationsOpen(false);
													if (item.link) navigate(item.link);
												}}
											>
												<span>{item.title}</span>
												<small>{item.message}</small>
												<time>
													{new Date(item.createdAt).toLocaleString("vi-VN")}
												</time>
											</button>
										))
									:	<p className="muted notification-empty">
											Chưa có thông báo.
										</p>
									}
								</div>
							)}
						</div>
					)}
					<button
						className="icon-button"
						onClick={toggleTheme}
						aria-label="Đổi giao diện"
					>
						{dark ?
							<Sun size={18} />
						:	<Moon size={18} />}
					</button>
					{session ?
						<>
							<button
								className="button login"
								onClick={() => navigate("/tai-khoan")}
							>
								{session.user.fullName || session.user.username}
							</button>
							<button
								className="button primary"
								onClick={() => {
									clearSession();
									navigate("/");
								}}
							>
								Đăng xuất
							</button>
						</>
					:	<>
							<button
								className="button login"
								onClick={() => navigate("/dang-nhap")}
							>
								Đăng nhập
							</button>
							<button
								className="button primary"
								onClick={() => navigate("/dang-ky")}
							>
								Đăng ký
							</button>
						</>
					}
					<button
						className="icon-button menu-button"
						onClick={() => setOpen(!open)}
						aria-label="Mở menu"
					>
						<Menu size={20} />
					</button>
				</div>
			</div>
			{open && (
				<nav
					className="container"
					style={{ display: "grid", gap: 6, paddingBottom: 12 }}
				>
					{links.map(([to, label]) => (
						<NavLink key={to} to={to} onClick={() => setOpen(false)}>
							{label}
						</NavLink>
					))}
				</nav>
			)}
		</header>
	);
}
