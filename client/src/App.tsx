import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import { AuthPage } from "./pages/Auth";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Admin from "./pages/Admin";
import { ProtectedRoute } from "./components/ProtectedRoute";
import JinderMatch from "./pages/JinderMatch";
import Account from "./pages/Account";
import CandidateMatch from "./pages/CandidateMatch";
import { FloatingChat } from "./components/FloatingChat";
import PublicProfile from "./pages/PublicProfile";
export default function App() {
	return (
		<BrowserRouter>
			<div className="app-shell">
				<Header />
				<main>
					<Routes>
<Route path="/" element={<Home />} />
						<Route path="/viec-lam" element={<Jobs />} />
						<Route path="/viec-lam/:id" element={<JobDetail />} />
						<Route
							path="/gioi-thieu/:id"
							element={
								<ProtectedRoute roles={["employee", "recruiter"]}>
									<PublicProfile />
								</ProtectedRoute>
							}
						/>
<Route
							path="/nha-tuyen-dung"
							element={
								<ProtectedRoute roles={["recruiter", "admin"]}>
									<RecruiterDashboard />
								</ProtectedRoute>
							}
						/>
						<Route path="/dang-nhap" element={<AuthPage mode="login" />} />
						<Route path="/dang-ky" element={<AuthPage mode="register" />} />
						<Route
							path="/ho-so"
							element={
								<ProtectedRoute roles={["employee"]}>
									<EmployeeDashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/jinder-match"
							element={
								<ProtectedRoute roles={["employee"]}>
									<JinderMatch />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/ung-vien-match"
							element={
								<ProtectedRoute roles={["recruiter", "admin"]}>
									<CandidateMatch />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/quan-tri"
							element={
								<ProtectedRoute roles={["admin"]}>
									<Admin />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/tai-khoan"
							element={
								<ProtectedRoute roles={["employee", "recruiter", "admin"]}>
									<Account />
								</ProtectedRoute>
							}
						/>
<Route path="*" element={<Home />} />
					</Routes>
				</main>
				<Footer />
				<FloatingChat />
			</div>
		</BrowserRouter>
	);
}
