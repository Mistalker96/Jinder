import { Navigate } from "react-router-dom";
import type { AccountRole } from "../services/authService";
import { getSession } from "../lib/session";
export function ProtectedRoute({
	roles,
	children,
}: {
	roles: AccountRole[];
	children: React.ReactNode;
}) {
	const session = getSession();
	if (!session) return <Navigate to="/dang-nhap" replace />;
	if (!roles.includes(session.user.role))
		return (
			<Navigate
				to={
					session.user.role === "admin" ? "/quan-tri"
					: session.user.role === "recruiter" ?
						"/nha-tuyen-dung"
					:	"/ho-so"
				}
				replace
			/>
		);
	return <>{children}</>;
}
