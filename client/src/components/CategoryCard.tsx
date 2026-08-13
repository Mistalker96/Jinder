import { BriefcaseBusiness, Code2, Megaphone, Users } from "lucide-react";

interface CategoryCardProps {
	name: string;
	count: number;
}
export function CategoryCard({ name, count }: CategoryCardProps) {
	const getIcon = () => {
		const value = name.toLowerCase();

		if (
			value.includes("công nghệ") ||
			value.includes("điện") ||
			value.includes("it")
		) {
			return <Code2 size={21} />;
		}

		if (value.includes("marketing") || value.includes("truyền thông")) {
			return <Megaphone size={21} />;
		}

		if (value.includes("nhân sự") || value.includes("hành chính")) {
			return <Users size={21} />;
		}

		return <BriefcaseBusiness size={21} />;
	};

	return (
		<div className="category-card">
			<div className="category-icon">{getIcon()}</div>

			<div>
				<h3>{name}</h3>
				<p>{count} tin đang tuyển</p>
			</div>
		</div>
	);
}
