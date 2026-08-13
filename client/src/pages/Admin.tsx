import { useEffect, useState } from "react";
import { getSession } from "../lib/session";

type Account = {
	_id: string;
	username: string;
	fullName: string;
	email: string;
	role: string;
	createdAt: string;
};
export default function Admin() {
	const [accounts, setAccounts] = useState<Account[]>([]),
		[error, setError] = useState("");
	useEffect(() => {
		const controller = new AbortController();
		const session = getSession();
		fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
			headers: { Authorization: `Bearer ${session?.token}` },
			signal: controller.signal,
		})
			.then(async (response) => {
				const body = await response.json();
				if (!response.ok) throw new Error(body.message);
				setAccounts(body.data);
			})
			.catch((reason) => {
				if (reason.name !== "AbortError")
					setError(reason.message || "Không thể tải dữ liệu");
			});
		return () => controller.abort();
	}, []);
	return (
		<div className="container page">
			<span className="eyebrow">QUẢN TRỊ HỆ THỐNG</span>
			<h1 className="title">Bảng điều khiển Admin</h1>
			<p className="muted">
				Quản lý tài khoản, tin tuyển dụng và dữ liệu hồ sơ trên Jinder.
			</p>
			<section className="panel" style={{ marginTop: 28, padding: 24 }}>
				<h2 style={{ marginTop: 0 }}>Tài khoản trong hệ thống</h2>
				{error ?
					<p style={{ color: "#c73434" }}>{error}</p>
				:	<div style={{ overflowX: "auto" }}>
						<table className="account-table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Tên hiển thị</th>
									<th>Vai trò</th>
									<th>Ngày tạo</th>
								</tr>
							</thead>
							<tbody>
								{accounts.map((account) => (
									<tr key={account._id}>
										<td>{account.username}</td>
										<td>{account.fullName || "—"}</td>
										<td>
											<span className="tag primary">{account.role}</span>
										</td>
										<td>
											{new Date(account.createdAt).toLocaleDateString("vi-VN")}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				}
			</section>
		</div>
	);
}
