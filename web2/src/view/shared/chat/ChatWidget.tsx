import { Headphones, ImagePlus, LoaderCircle, Minus, SendHorizontal, X } from "lucide-react";
import { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import authSelectors from "src/modules/auth/authSelectors";
import ChatService, { ChatConversation, ChatMessage } from "src/modules/chat/chatService";
import FileUploader, { fileStorages } from "src/modules/shared/fileUpload/fileUploader";
import Errors from "src/modules/shared/error/errors";
import { getSocket } from "src/modules/shared/socket/socketClient";
import chatWidgetBus from "src/view/shared/chat/chatWidgetBus";

const DEFAULT_TITLE = "KingFriend Support";

function formatTime(date?: string) {
  if (!date) return "";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Live chat with the support team. There is no floating launcher: the panel only opens
// through chatWidgetBus (Deposit, Withdrawal, and the Online Service page).
export default function ChatWidget() {
  const currentUser = useSelector(authSelectors.selectCurrentUser);
  const userId = currentUser?.id;
  // On the Trade page the launcher would cover the order ticket, so it moves to the
  // chart's bottom-right corner, just left of the ticket.
  const onTrade = useLocation().pathname.startsWith("/app/trade");
  const [ticketGap, setTicketGap] = useState<number | null>(null);

  useEffect(() => {
    if (!onTrade) {
      setTicketGap(null);
      return;
    }
    const measure = () => {
      const ticket = document.querySelector<HTMLElement>(".order-ticket");
      const box = ticket?.getBoundingClientRect();
      // Hidden ticket (phone layout, other tab): fall back to raising the button instead.
      setTicketGap(box && box.width > 0 ? window.innerWidth - box.left : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [onTrade]);

  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [widgetTitle, setWidgetTitle] = useState(DEFAULT_TITLE);
  const [allowReopen, setAllowReopen] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const conversationRef = useRef<ChatConversation | null>(null);
  const bootstrappedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  conversationRef.current = conversation;

  const addMessage = (message: ChatMessage) =>
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));

  // Live updates from support: new messages, chat closed/reopened, history wiped.
  useEffect(() => {
    if (!userId) return;
    const socket = getSocket(userId, false);

    const isCurrent = (conversationId?: string) =>
      Boolean(conversationRef.current && conversationId === conversationRef.current.id);

    const onMessage = (payload: { conversation: ChatConversation; message: ChatMessage }) => {
      if (!isCurrent(payload.conversation?.id)) return;
      addMessage(payload.message);
      setConversation(payload.conversation);
    };
    const onClosed = ({ conversationId }) => {
      if (isCurrent(conversationId)) setConversation((prev) => (prev ? { ...prev, status: "closed" } : prev));
    };
    const onReopened = ({ conversationId }) => {
      if (isCurrent(conversationId)) setConversation((prev) => (prev ? { ...prev, status: "open" } : prev));
    };
    const onDeleted = async ({ conversationId }) => {
      if (!isCurrent(conversationId)) return;
      // An agent wiped the history: start clean with a new conversation.
      setMessages([]);
      try {
        setConversation(await ChatService.myConversation());
      } catch (err) {
        Errors.handle(err);
        setConversation(null);
        bootstrappedRef.current = false;
      }
    };

    socket?.on("chat:message", onMessage);
    socket?.on("chat:closed", onClosed);
    socket?.on("chat:reopened", onReopened);
    socket?.on("chat:deleted", onDeleted);
    return () => {
      socket?.off("chat:message", onMessage);
      socket?.off("chat:closed", onClosed);
      socket?.off("chat:reopened", onReopened);
      socket?.off("chat:deleted", onDeleted);
    };
  }, [userId]);

  // Load (or create) the conversation the first time the widget opens. Opening is also
  // when the server logs its greeting, so support sees the chat even if nothing is typed.
  const loadConversation = async () => {
    bootstrappedRef.current = true;
    setLoading(true);
    setError("");
    try {
      const conv = await ChatService.myConversation();
      setConversation(conv);
      const history = await ChatService.listMessages(conv.id, { limit: 200 });
      setMessages(history.rows || []);
    } catch (err) {
      Errors.handle(err);
      setError(`Couldn't load the chat: ${Errors.selectMessage(err)}`);
      bootstrappedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId && !bootstrappedRef.current) loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  // A different user signed in: drop the previous user's chat.
  useEffect(() => {
    bootstrappedRef.current = false;
    setConversation(null);
    setMessages([]);
    setOpen(false);
  }, [userId]);

  useEffect(
    () =>
      chatWidgetBus.onOpen((message) => {
        if (message) setText(message);
        setOpen(true);
      }),
    []
  );

  // Admin-configurable widget title and reopen policy.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    ChatService.getSettings()
      .then((settings) => {
        if (cancelled) return;
        setWidgetTitle(settings?.chatWidgetTitle || DEFAULT_TITLE);
        setAllowReopen(settings?.chatAllowReopenClosed !== false);
      })
      .catch(Errors.handle);
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !previewImage) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, previewImage]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const handleSend = async () => {
    const value = text.trim();
    if (!value || !conversation || sending) return;
    setSending(true);
    setText("");
    setError("");
    try {
      addMessage(await ChatService.sendMessage(conversation.id, { type: "text", text: value }));
    } catch (err) {
      Errors.handle(err);
      setText(value);
      setError(`Message not sent: ${Errors.selectMessage(err)}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendImageFile = async (file: File) => {
    if (!conversation) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await FileUploader.upload(file, { storage: fileStorages.chatAttachments, image: true });
      addMessage(await ChatService.sendMessage(conversation.id, { type: "image", attachmentUrl: uploaded.downloadUrl }));
    } catch (err) {
      Errors.handle(err);
      setError(`Image not sent: ${Errors.selectMessage(err)}`);
    } finally {
      setUploading(false);
    }
  };

  const isClosed = conversation?.status === "closed";
  const composerDisabled = !conversation || (isClosed && !allowReopen);

  // Paste a screenshot or copied image straight into the chat.
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (composerDisabled) return;
    const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith("image/"));
    const file = item?.getAsFile();
    if (file) {
      e.preventDefault();
      sendImageFile(file);
    }
  };

  if (!userId) return null;

  return (
    <div
      className={"kc-chat-root" + (onTrade ? (ticketGap === null ? " raised" : " compact") : "")}
      style={onTrade && ticketGap !== null ? { right: ticketGap + 20, bottom: 40 } : undefined}
    >
      {open && (
        <section className="kc-chat-panel" role="dialog" aria-label={widgetTitle}>
          <header className="kc-chat-header">
            <span className="kc-chat-header-icon">
              <Headphones size={17} />
            </span>
            <b className="kc-chat-title">{widgetTitle}</b>
            <button type="button" className="kc-chat-icon-btn" onClick={() => setOpen(false)} aria-label="Minimize chat">
              <Minus size={16} />
            </button>
            <button type="button" className="kc-chat-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={16} />
            </button>
          </header>

          <div className="kc-chat-body" ref={bodyRef} aria-live="polite">
            {loading && (
              <div className="kc-chat-system">
                <LoaderCircle size={14} className="kc-spin" /> Loading conversation…
              </div>
            )}

            {messages.map((msg) => {
              const isAdmin = msg.senderType === "admin";
              return (
                <div key={msg.id} className={"kc-chat-message " + (isAdmin ? "kc-chat-message-admin" : "kc-chat-message-customer")}>
                  {isAdmin && (
                    <span className="kc-chat-avatar">
                      <Headphones size={12} />
                    </span>
                  )}
                  <div className="kc-chat-bubble">
                    {msg.type === "image" && msg.attachmentUrl ? (
                      <button type="button" className="kc-chat-image-btn" onClick={() => setPreviewImage(msg.attachmentUrl!)}>
                        <img src={msg.attachmentUrl} alt="Attachment" className="kc-chat-image" />
                      </button>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                    <div className="kc-chat-time">{formatTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })}

            {isClosed && <div className="kc-chat-system">This chat has been closed.</div>}
            {error && (
              <div className="kc-chat-error" role="alert">
                {error}
                {!conversation && (
                  <button type="button" onClick={loadConversation}>
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="kc-chat-composer">
            <button
              type="button"
              className="kc-chat-icon-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || composerDisabled}
              aria-label="Attach image"
            >
              {uploading ? <LoaderCircle size={18} className="kc-spin" /> : <ImagePlus size={18} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await sendImageFile(file);
                e.target.value = "";
              }}
            />
            <input
              ref={inputRef}
              type="text"
              className="kc-chat-input"
              placeholder="Type a message..."
              aria-label="Message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              disabled={composerDisabled}
            />
            <button
              type="button"
              className="kc-chat-send-btn"
              onClick={handleSend}
              disabled={!text.trim() || sending || composerDisabled}
              aria-label="Send message"
            >
              <SendHorizontal size={16} />
            </button>
          </div>
        </section>
      )}

      {previewImage && (
        <div className="kc-image-lightbox" onClick={() => setPreviewImage(null)}>
          <button type="button" className="kc-image-lightbox-close" onClick={() => setPreviewImage(null)} aria-label="Close image">
            <X size={20} />
          </button>
          <img src={previewImage} alt="Attachment" />
        </div>
      )}
    </div>
  );
}
