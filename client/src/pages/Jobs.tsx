import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { JobCard } from "../components/JobCard";
import { SearchBar } from "../components/SearchBar";
import { JobService } from "../services/jobService";
import type { Job, JobResponse } from "../types/job";
export default function Jobs() {
	const [params, setSearchParams] = useSearchParams();
	const [jobs, setJobs] = useState<Job[]>([]),
		[loading, setLoading] = useState(true),
		[sort, setSort] = useState("newest"),
		[pagination, setPagination] = useState<JobResponse["pagination"] | null>(
			null,
		);
	const keyword = params.get("keyword") || "",
		city = params.get("city") || "",
		field = params.get("field") || "",
		type = params.get("type") || "",
		minSalary = Number(params.get("minSalary") || 0),
		maxSalary = Number(params.get("maxSalary") || 100),
		requestedPage = Number(params.get("page") || 1),
		currentPage =
			Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	const setFilter = (name: string, value: string | number) => {
		const next = new URLSearchParams(params);
		if (value) next.set(name, String(value));
		else next.delete(name);
		next.set("page", "1");
		setSearchParams(next);
	};
	const changePage = (page: number) => {
		const next = new URLSearchParams(params);
		next.set("page", String(page));
		setSearchParams(next);
	};
	const clearFilters = () => {
		setSort("newest");
		setSearchParams({});
	};
	useEffect(() => {
		const controller = new AbortController();
		JobService.getJobs(
			{
				page: currentPage,
				limit: 10,
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
			.then((result) => {
				setJobs(result.data);
				setPagination(result.pagination);
			})
			.catch((error) => {
				if (error.name !== "AbortError") {
					setJobs([]);
					setPagination(null);
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [keyword, city, field, type, minSalary, maxSalary, sort, currentPage]);
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
	const pageNumbers = useMemo(() => {
		if (!pagination) return [];
		const start = Math.max(
			1,
			Math.min(
				pagination.currentPage - 2,
				Math.max(1, pagination.totalPages - 4),
			),
		);
		const end = Math.min(pagination.totalPages, start + 4);
		return Array.from({ length: end - start + 1 }, (_, index) => start + index);
	}, [pagination]);
	return (
		<div className="container page">
			<h1 className="title">Tìm việc làm</h1>
			<SearchBar initialQuery={keyword} initialLocation={city} />
			<div className="listing-layout">
				<aside
					className="panel filters"
				>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<h2>Bộ lọc</h2>
						<button
							className="button ghost"
							onClick={clearFilters}
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
							Tìm thấy <strong>{pagination?.totalJobs ?? jobs.length}</strong>{" "}
							việc làm{" "}
							{keyword && (
								<>
									cho <span className="tag primary">{keyword}</span>
								</>
							)}
						</p>
						<div style={{ display: "flex", gap: 8 }}>
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
					{!loading && pagination && pagination.totalPages > 1 && (
						<nav className="pagination" aria-label="Job list pagination">
							<button
								className="button ghost"
								disabled={!pagination.hasPreviousPage}
								onClick={() => changePage(pagination.currentPage - 1)}
							>
								← Trang trước
							</button>
							{pageNumbers.map((page) => (
								<button
									aria-current={
										page === pagination.currentPage ? "page" : undefined
									}
									className={`button ${page === pagination.currentPage ? "primary" : "ghost"}`}
									key={page}
									onClick={() => changePage(page)}
								>
									{page}
								</button>
							))}
							<button
								className="button ghost"
								disabled={!pagination.hasNextPage}
								onClick={() => changePage(pagination.currentPage + 1)}
							>
								Trang sau →
							</button>
						</nav>
					)}
				</section>
			</div>
		</div>
	);
}
