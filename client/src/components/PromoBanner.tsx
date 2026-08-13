import { useEffect, useState } from "react";
const slides = [
	"/1.jpeg",
	"/2.jpeg",
	"/3.jpeg",
	"/4.jpeg",
	"/5.jpeg",
	"/6.jpeg",
	"/7.jpeg",
	"/8.jpeg",
];
export function PromoBanner() {
	const [index, setIndex] = useState(0);
	useEffect(() => {
		const timer = window.setInterval(
			() => setIndex((value) => (value + 1) % slides.length),
			4500,
		);
		return () => window.clearInterval(timer);
	}, []);
	return (
		<section className="container promo-wrap">
			<div className="promo-banner">
				<img src={slides[index]} alt="Ưu đãi tuyển dụng Jinder" />
				<div className="promo-overlay">
					<span>JINDER PROMO</span>
					<strong>Kết nối cơ hội mới mỗi ngày</strong>
				</div>
				<div className="promo-dots">
					{slides.map((_, dot) => (
						<button
							key={dot}
							aria-label={`Banner ${dot + 1}`}
							className={dot === index ? "active" : ""}
							onClick={() => setIndex(dot)}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
