import dns from "node:dns";
import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/database.js";

// Use public DNS servers when resolving a MongoDB Atlas hostname.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function main() {
	dotenv.config();

	const port = process.env.PORT || 5000;

	try {
		await connectDatabase();
		app.listen(port, "0.0.0.0", () => {
			console.log("Server is running on port: " + port);
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

main().catch(console.error);
