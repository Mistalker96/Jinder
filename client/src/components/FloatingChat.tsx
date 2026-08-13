import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSession } from "../lib/session";
import {
	MessageService,
	type ChatMessage,
	type Conversation,
} from "../services/messageService";

export function FloatingChat() {
	const [session, setSession] = useState(getSession());
	const [open, setOpen] = useState(false);
	const [inbox, setInbox] = useState<Conversation[]>([]);
	const [unread, setUnread] = useState(0);
	const [selected, setSelected] = useState<Conversation | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [content, setContent] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const refresh = () => setSession(getSession());
		window.addEventListener("jinder-auth-change", refresh);
		return () => window.removeEventListener("jinder-auth-change", refresh);
	}, []);
	useEffect(() => {
		if (!session || session.user.role === "admin") return;
		const controller = new AbortController();
		const load = () =>
			MessageService.inbox(controller.signal)
				.then((result) => {
					setInbox(result.data);
					setUnread(result.unread);
				})
				.catch((reason) => {
					if (reason.name !== "AbortError") setError(reason.message);
				});
		load();
		const timer = window.setInterval(load, 15000);
		return () => {
			controller.abort();
			window.clearInterval(timer);
		};
	}, [session]);
	useEffect(() => {
		if (!selected) return;
		const controller = new AbortController();
		const load = () =>
			MessageService.messages(selected._id, controller.signal)
				.then((result) => {
					setMessages(result.data);
					setUnread(result.unread);
					setInbox((items) =>
						items.map((item) =>
							item._id === selected._id ? { ...item, unread: 0 } : item,
						),
					);
				})
				.catch((reason) => {
					if (reason.name !== "AbortError") setError(reason.message);
				});
		load();
		const timer = window.setInterval(load, 5000);
		return () => {
			controller.abort();
			window.clearInterval(timer);
		};
	}, [selected]);
	if (!session || session.user.role === "admin") return null;

	const send = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!selected || !content.trim()) return;
		try {
			const result = await MessageService.send(selected._id, content);
			setMessages((items) => [...items, result.data]);
			setContent("");
			setError("");
		} catch (reason) {
			setError(
				reason instanceof Error ? reason.message : "Không thể gửi tin nhắn",
			);
		}
	};

	return (
		<>
			{open && (
				<section className="chat-window" aria-label="Hộp thư">
					<header className="chat-header">
						<div>
							{selected ?
								<Link
									className="chat-profile-link"
									to={`/gioi-thieu/${selected.otherUser._id}`}
									onClick={() => setOpen(false)}
								>
									{selected.otherUser.fullName || selected.otherUser.username}
								</Link>
							:	<strong>Tin nhắn</strong>}
							{selected && (
								<button className="chat-back" onClick={() => setSelected(null)}>
									← Hộp thư
								</button>
							)}
						</div>
						<button
							className="icon-button"
							onClick={() => setOpen(false)}
							aria-label="Đóng chat"
						>
							<X size={18} />
						</button>
					</header>
					{selected ?
						<>
							<div className="chat-messages">
								{messages.length ?
									messages.map((message) => (
										<div
											key={message._id}
											className={`chat-message ${message.sender === session.user.id ? "mine" : "theirs"}`}
										>
											{message.content}
											<time>
												{new Date(message.createdAt).toLocaleTimeString(
													"vi-VN",
													{ hour: "2-digit", minute: "2-digit" },
												)}
											</time>
										</div>
									))
								:	<p className="muted chat-placeholder">
										Bắt đầu cuộc trò chuyện.
									</p>
								}
							</div>
							<form className="chat-form" onSubmit={send}>
								<input
									value={content}
									maxLength={1000}
									onChange={(event) => setContent(event.target.value)}
									placeholder="Nhập tin nhắn..."
									aria-label="Nội dung tin nhắn"
								/>
								<button className="icon-button" aria-label="Gửi tin nhắn">
									<Send size={18} />
								</button>
							</form>
						</>
					:	<div className="chat-inbox">
							{inbox.length ?
								inbox.map((conversation) => (
									<div className="chat-inbox-item" key={conversation._id}>
										<button
											className="chat-open-button"
											onClick={() => {
												setSelected(conversation);
												setError("");
											}}
											aria-label={`Mở hội thoại với ${conversation.otherUser.fullName || conversation.otherUser.username}`}
										>
											<span className="chat-avatar">
												{(
													conversation.otherUser.fullName ||
													conversation.otherUser.username
												)
													.charAt(0)
													.toUpperCase()}
											</span>
										</button>
										<span>
											<Link
												className="chat-profile-link"
												to={`/gioi-thieu/${conversation.otherUser._id}`}
												onClick={() => setOpen(false)}
											>
												{conversation.otherUser.fullName ||
													conversation.otherUser.username}
											</Link>
											<button
												className="chat-preview"
												onClick={() => {
													setSelected(conversation);
													setError("");
												}}
											>
												{conversation.lastMessage?.content ||
													"Bắt đầu trò chuyện"}
											</button>
										</span>
										{conversation.unread > 0 && <b>{conversation.unread}</b>}
									</div>
								))
							:	<p className="muted chat-placeholder">
									Hộp thư chưa có cuộc trò chuyện.
								</p>
							}
						</div>
					}
					{error && (
						<p className="chat-error" role="alert">
							{error}
						</p>
					)}
				</section>
			)}
			<button
				className="floating-chat-button"
				onClick={() => setOpen((value) => !value)}
				aria-label="Mở hộp thư"
				aria-expanded={open}
			>
				<MessageCircle size={25} />
				{unread > 0 && <span>{unread > 99 ? "99+" : unread}</span>}
			</button>
		</>
	);
}
