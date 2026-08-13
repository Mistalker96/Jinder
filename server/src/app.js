import express from "express";
import cors from "cors";
import jobRoutes from "./routes/job.route.js";
import authRoutes from "./routes/auth.route.js";
import employeeRoutes from "./routes/employee.route.js";
import savedJobRoutes from "./routes/saved-job.route.js";
import notificationRoutes from "./routes/notification.route.js";
import messageRoutes from "./routes/message.route.js";
import profileRoutes from "./routes/profile.route.js";
import recruiterRoutes from "./routes/recruiter.route.js";
const app = express();
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	}),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Job Portal API is running",
	});
});
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});
app.use((err, req, res, next) => {
	console.error(err.message);
	res.status(err.status || 500).json({
		success: false,
		message: err.status ? err.message : "Internal Server Error",
	});
});

export default app;
