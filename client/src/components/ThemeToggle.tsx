import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeToggle() {
	const [theme, setTheme] = useState<"dark" | "light">(() => {
		const saved = localStorage.getItem("theme");
		return saved === "light" ? "light" : "dark";
	});

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);
	const toggleTheme = () => {
		setTheme((current) => (current === "dark" ? "light" : "dark"));
	};

	return (
		<button
			type="button"
			className="icon-button"
			onClick={toggleTheme}
			aria-label={
				theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
			}
			title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
		>
			{theme === "dark" ?
				<Sun size={19} />
			:	<Moon size={19} />}
		</button>
	);
}
