import RecruiterProfile from "../models/recruiter-profile.model.js";
import { number, text } from "../utils/validation.js";

const stringList = (value, name, maxItems, maxLength) => {
	if (!Array.isArray(value) || value.length > maxItems)
		throw Object.assign(
			new Error(`${name} must be an array with at most ${maxItems} items`),
			{ status: 400 },
		);
	return value.map((item) =>
		text(item, name, { required: true, max: maxLength }),
	);
};

export async function getMyRecruiterProfile(req, res) {
	const data = await RecruiterProfile.findOne({ user: req.user._id }).lean();
	return res.json({ success: true, data });
}

export async function updateMyRecruiterProfile(req, res) {
	try {
		const input = {
			companyName: text(req.body.companyName, "companyName", {
				required: true,
				max: 150,
			}),
			industry: text(req.body.industry, "industry", { max: 120 }),
			employeeCount: number(req.body.employeeCount, "employeeCount", {
				min: 1,
				max: 1000000,
			}),
			jobCategories: stringList(
				req.body.jobCategories || [],
				"jobCategories",
				30,
				100,
			),
			companyDescription: text(
				req.body.companyDescription,
				"companyDescription",
				{ max: 4000 },
			),
			website: text(req.body.website, "website", { max: 500 }),
		};
		const data = await RecruiterProfile.findOneAndUpdate(
			{ user: req.user._id },
			input,
			{ new: true, upsert: true, runValidators: true },
		);
		return res.json({ success: true, data });
	} catch (error) {
		return res
			.status(error.status || 400)
			.json({ success: false, message: error.message });
	}
}
