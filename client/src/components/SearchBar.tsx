import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export function SearchBar({
	initialQuery = "",
	initialLocation = "",
	compact = false,
}: {
	initialQuery?: string;
	initialLocation?: string;
	compact?: boolean;
}) {
	const [keyword, setKeyword] = useState(initialQuery),
		[city, setCity] = useState(initialLocation);
	const navigate = useNavigate();
	return (
		<form
			className="search-bar"
			onSubmit={(event) => {
				event.preventDefault();
				const query = new URLSearchParams();
				if (keyword.trim()) query.set("keyword", keyword.trim());
				if (city.trim()) query.set("city", city.trim());
				navigate(`/viec-lam${query.size ? `?${query}` : ""}`);
			}}
		>
			<div className="search-field">
				<Search size={19} />
				<input
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					placeholder="Vị trí, công ty hoặc kỹ năng"
				/>
			</div>
			<div className="search-field">
				<MapPin size={19} />
				<input
					value={city}
					onChange={(e) => setCity(e.target.value)}
					placeholder="Tất cả địa điểm"
				/>
			</div>
			<button className="button primary" type="submit">
				{compact ? "Tìm" : "Tìm việc"}
			</button>
		</form>
	);
}
