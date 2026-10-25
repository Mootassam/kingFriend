import { useEffect, useState } from 'react';
import ChatService from 'src/modules/chat/chatService';

const DEFAULT_WELCOME_MESSAGE =
  'Hello! You are now connected to FXCC Capitals Support. Please type a message to begin.';

function ChatSettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [allowReopen, setAllowReopen] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMessage, setAutoReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await ChatService.getSettings();
        if (cancelled) return;
        setSettings(data);
        setTitle(data?.chatWidgetTitle || 'FXCC Support');
        setAllowReopen(data?.chatAllowReopenClosed !== false);
        setWelcomeMessage(data?.chatWelcomeMessage || DEFAULT_WELCOME_MESSAGE);
        setAutoReplyEnabled(data?.chatAutoReplyEnabled === true);
        setAutoReplyMessage(data?.chatAutoReplyMessage || '');
      } catch (err) {
        console.error('Load chat settings error:', err);
        if (!cancelled) setError('Could not load settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await ChatService.saveSettings({
        ...settings,
        chatWidgetTitle: title.trim() || 'FXCC Support',
        chatAllowReopenClosed: allowReopen,
        chatWelcomeMessage: welcomeMessage.trim() || DEFAULT_WELCOME_MESSAGE,
        chatAutoReplyEnabled: autoReplyEnabled,
        chatAutoReplyMessage: autoReplyMessage.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Save chat settings error:', err);
      setError('Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="csm-overlay" onClick={onClose}>
      <div className="csm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="csm-header">
          <h5>Customer Support Settings</h5>
          <button type="button" className="csm-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" />
          </button>
        </div>

        {loading ? (
          <div className="csm-loading">
            <i className="fas fa-spinner fa-spin" /> Loading…
          </div>
        ) : (
          <div className="csm-body">
            <label className="csm-field">
              <span className="csm-label">Widget title</span>
              <input
                type="text"
                className="csm-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="FXCC Support"
                maxLength={60}
              />
              <span className="csm-hint">
                Shown at the top of the chat widget on the customer site.
              </span>
            </label>

            <label className="csm-toggle-row">
              <span>
                <span className="csm-label">Allow customers to reactivate closed chats</span>
                <span className="csm-hint">
                  When on, a customer can send a new message into a closed
                  chat and it reopens automatically. When off, they can't
                  reply until an agent reopens it.
                </span>
              </span>
              <span
                className={`csm-switch ${allowReopen ? 'is-on' : ''}`}
                onClick={() => setAllowReopen((v) => !v)}
                role="switch"
                aria-checked={allowReopen}
              >
                <span className="csm-switch-knob" />
              </span>
            </label>

            <label className="csm-field">
              <span className="csm-label">First message</span>
              <textarea
                className="csm-input csm-textarea"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder={DEFAULT_WELCOME_MESSAGE}
                maxLength={500}
                rows={3}
              />
              <span className="csm-hint">
                Shown automatically the moment a customer opens the live chat
                widget, before they've sent anything.
              </span>
            </label>

            <label className="csm-toggle-row">
              <span>
                <span className="csm-label">Automatic second message</span>
                <span className="csm-hint">
                  When on, this message is sent automatically right after the
                  customer's first message in a conversation, as if an agent
                  replied instantly. It's sent once per conversation.
                </span>
              </span>
              <span
                className={`csm-switch ${autoReplyEnabled ? 'is-on' : ''}`}
                onClick={() => setAutoReplyEnabled((v) => !v)}
                role="switch"
                aria-checked={autoReplyEnabled}
              >
                <span className="csm-switch-knob" />
              </span>
            </label>

            {autoReplyEnabled && (
              <label className="csm-field">
                <span className="csm-label">Automatic reply text</span>
                <textarea
                  className="csm-input csm-textarea"
                  value={autoReplyMessage}
                  onChange={(e) => setAutoReplyMessage(e.target.value)}
                  placeholder="Thanks for reaching out! An agent will be with you shortly."
                  maxLength={500}
                  rows={3}
                />
              </label>
            )}

            {error && <div className="csm-error">{error}</div>}
          </div>
        )}

        <div className="csm-footer">
          <button type="button" className="csm-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="csm-btn-primary"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? <i className="fas fa-spinner fa-spin" /> : 'Save'}
          </button>
        </div>
      </div>

      <style>{`
        .csm-overlay {
          position: fixed; inset: 0; background: var(--overlay);
          display: flex; align-items: center; justify-content: center; z-index: 10000;
        }
        .csm-modal {
          width: 440px; max-width: calc(100vw - 32px); background: var(--surface);
          border-radius: 12px; box-shadow: var(--shadow-lg);
          display: flex; flex-direction: column; max-height: calc(100vh - 64px);
        }
        .csm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px; border-bottom: 1px solid var(--border);
        }
        .csm-header h5 { margin: 0; font-size: 15px; font-weight: 700; color: var(--text); }
        .csm-close {
          border: none; background: transparent; color: var(--text-muted); width: 28px; height: 28px;
          border-radius: 6px; cursor: pointer; font-size: 13px;
        }
        .csm-close:hover { background: var(--surface-3); color: var(--text); }

        .csm-loading { padding: 40px; text-align: center; color: var(--text-muted); font-size: 13px; }

        .csm-body { padding: 18px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }

        .csm-field { display: flex; flex-direction: column; gap: 6px; }
        .csm-label { font-size: 13px; font-weight: 600; color: var(--text); }
        .csm-hint { font-size: 11.5px; color: var(--text-muted); line-height: 1.4; }
        .csm-input {
          border: 1px solid var(--border-strong); border-radius: 8px; padding: 9px 12px;
          font-size: 13.5px; outline: none; color: var(--text);
        }
        .csm-input:focus { border-color: var(--accent); }
        .csm-textarea { resize: vertical; font-family: inherit; }

        .csm-toggle-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; cursor: pointer;
        }
        .csm-toggle-row > span:first-child { display: flex; flex-direction: column; gap: 4px; }

        .csm-switch {
          width: 40px; height: 22px; border-radius: 11px; background: var(--border-strong);
          position: relative; flex-shrink: 0; cursor: pointer; transition: background 0.15s ease; margin-top: 2px;
        }
        .csm-switch.is-on { background: var(--accent); }
        .csm-switch-knob {
          position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%;
          background: var(--surface); transition: left 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }
        .csm-switch.is-on .csm-switch-knob { left: 20px; }

        .csm-error { color: var(--danger); font-size: 12.5px; }

        .csm-footer {
          display: flex; justify-content: flex-end; gap: 8px; padding: 14px 18px;
          border-top: 1px solid var(--border);
        }
        .csm-btn-secondary {
          border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-2); border-radius: 8px;
          padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .csm-btn-secondary:hover { background: var(--surface-3); }
        .csm-btn-primary {
          border: none; background: var(--accent); color: #fff; border-radius: 8px;
          padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; min-width: 64px;
        }
        .csm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default ChatSettingsModal;
