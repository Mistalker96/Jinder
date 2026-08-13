import mongoose from "mongoose";
async function connectDatabase() {
	try {
		if (!process.env.MONGODB_URI) {
			throw new Error("MONGODB_URI is missing");
		}
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("MongoDB Connected Successfully");
		console.log("Database:", mongoose.connection.name);
	} catch (error) {
		console.error("MongoDB Connection Failed:", error.message);
		throw error;
	}
}

export default connectDatabase;
