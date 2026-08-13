import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { JobCard } from "../components/JobCard";
import { SearchBar } from "../components/SearchBar";
import { JobService } from "../services/jobService";
import type { Job } from "../types/job";
export default function Jobs() {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const [jobs, setJobs] = useState<Job[]>([]),
		[loading, setLoading] = useState(true),
		[filters, setFilters] = useState(false),
		[sort, setSort] = useState("newest");
	const keyword = params.get("keyword") || "",
		city = params.get("city") || "",
		field = params.get("field") || "",
		type = params.get("type") || "",
		minSalary = Number(params.get("minSalary") || 0),
		maxSalary = Number(params.get("maxSalary") || 100);
	const setFilter = (name: string, value: string | number) => {
		const next = new URLSearchParams(params);
		if (value) next.set(name, String(value));
		else next.delete(name);
		navigate(`/viec-lam?${next.toString()}`);
	};
	useEffect(() => {
		const controller = new AbortController();
		JobService.getJobs(
			{
				page: 1,
				limit: 12,
				sort,
				...(keyword ? { keyword } : {}),
				...(city ? { city } : {}),
				...(field ? { job_fields: field } : {}),
				...(type ? { job_type: type } : {}),
				...(minSalary ? { salary_min: minSalary } : {}),
				...(maxSalary < 100 ? { salary_max: maxSalary } : {}),
			},
			controller.signal,
		)
			.then((result) => setJobs(result.data))
			.catch((error) => {
				if (error.name !== "AbortError") setJobs([]);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [keyword, city, field, type, minSalary, maxSalary, sort]);
	const options = useMemo(
		() => ({
			cities: [...new Set(jobs.map((job) => job.city).filter(Boolean))],
			fields: [
				...new Set(
					jobs.flatMap(
						(job) => job.job_fields?.split(",").map((x) => x.trim()) || [],
					),
				),
			],
		}),
		[jobs],
	);
	return (
		<div className="container page">
			<h1 className="title">Tìm việc làm</h1>
			<SearchBar initialQuery={keyword} initialLocation={city} />
			<div className="listing-layout">
				<aside
					className="panel filters"
					style={{ display: filters || innerWidth >= 760 ? "block" : "none" }}
				>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<h2>Bộ lọc</h2>
						<button
							className="button ghost"
							onClick={() => location.assign("/viec-lam")}
						>
							Xóa lọc
						</button>
					</div>
					<div className="filter-group">
						<label>Địa điểm</label>
						{options.cities.map((item) => (
							<label className="check" key={item}>
								<input
									type="checkbox"
									checked={city === item}
									onChange={() => setFilter("city", city === item ? "" : item)}
								/>{" "}
								{item}
							</label>
						))}
					</div>
					<div className="filter-group">
						<label>Ngành nghề</label>
						{options.fields.slice(0, 7).map((item) => (
							<label className="check" key={item}>
								<input
									type="checkbox"
									checked={field === item}
									onChange={() =>
										setFilter("field", field === item ? "" : item)
									}
								/>{" "}
								{item}
							</label>
						))}
					</div>
					<div className="filter-group">
						<label>
							Mức lương: {minSalary} - {maxSalary} triệu
						</label>
						<input
							className="salary-range"
							type="range"
							min="0"
							max="100"
							step="5"
							value={minSalary}
							onChange={(event) => setFilter("minSalary", event.target.value)}
						/>
						<input
							className="salary-range"
							type="range"
							min="0"
							max="100"
							step="5"
							value={maxSalary}
							onChange={(event) => setFilter("maxSalary", event.target.value)}
						/>
					</div>
				</aside>
				<section>
					<div className="listing-top">
						<p className="muted">
							Tìm thấy <strong>{jobs.length}</strong> việc làm{" "}
							{keyword && (
								<>
									cho <span className="tag primary">{keyword}</span>
								</>
							)}
						</p>
						<div style={{ display: "flex", gap: 8 }}>
							<button className="button" onClick={() => setFilters(!filters)}>
								<SlidersHorizontal size={16} /> Bộ lọc
							</button>
							<select
								className="select"
								value={sort}
								onChange={(e) => setSort(e.target.value)}
							>
								<option value="newest">Mới nhất</option>
								<option value="salary_desc">Lương cao nhất</option>
								<option value="salary_asc">Lương thấp nhất</option>
							</select>
						</div>
					</div>
					<div className="job-list">
						{loading ?
							<div className="empty">Đang tải việc làm...</div>
						:	jobs.map((job) => <JobCard key={job._id} job={job} />)}
						{!loading && !jobs.length && (
							<div className="empty">Không tìm thấy việc làm phù hợp.</div>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
