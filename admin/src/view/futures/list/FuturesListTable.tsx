import { useState, useEffect, useCallback } from 'react';
import authAxios from 'src/modules/shared/axios/authAxios';
import AuthCurrentTenant from 'src/modules/auth/authCurrentTenant';
import Spinner from 'src/view/shared/Spinner';

// ── Types ──────────────────────────────────────────────────────────────────

interface TradeOrder {
  id: string;
  _id: string;
  orderType: 'market' | 'pending';
  symbol: string;
  symbolName: string;
  direction: 'buy' | 'sell';
  lots: number;
  multiplier: number;
  estimatedMargin?: number;
  margin: number;
  fee: number;
  entryPrice?: number;
  targetPrice?: number;
  referencePrice?: number;
  triggerAbove?: boolean;
  closePrice?: number;
  takeProfit?: number | null;
  stopLoss?: number | null;
  pnl: number;
  // Injection fields (set when admin triggers chart animation)
  injectionTargetPrice?: number;
  injectionStartedAt?:   string;
  injectionDurationMs?:  number;
  status: 'active' | 'waiting' | 'closed' | 'cancelled';
  closeReason?: string;
  orderNumber: string;
  openTime?: string;
  closeTime?: string;
  createdAt: string;
  user?: { id: string; email: string; firstName?: string; lastName?: string };
}

type ControlType = 'profit' | 'loss';

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch { return iso; }
}

function fmtPrice(p?: number | null): string {
  if (p == null) return '—';
  if (p >= 10000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 100)   return p.toFixed(2);
  if (p >= 10)    return p.toFixed(3);
  return p.toFixed(5);
}

function fmtMoney(n: number): string {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CONTRACT_SIZE = 100;

function calcNetPnl(margin: number, pct: number, control: ControlType): number {
  const abs = parseFloat(((margin * pct) / 100).toFixed(5));
  return control === 'profit' ? abs : -abs;
}

function calcPredictedClosePrice(order: TradeOrder, pct: number, control: ControlType): number | null {
  if (!order.entryPrice) return null;
  const estMargin = order.estimatedMargin ?? order.margin;
  const netPnl    = calcNetPnl(estMargin, pct, control);
  const fee       = order.fee || 0;
  const lots      = order.lots || 1;
  const priceDiff = (netPnl + fee) / (lots * CONTRACT_SIZE);
  const raw       = order.direction === 'buy'
    ? order.entryPrice + priceDiff
    : order.entryPrice - priceDiff;
  return parseFloat(raw.toFixed(5));
}

function fmtCountdown(isoDate?: string): string {
  if (!isoDate) return '';
  const rem = new Date(isoDate).getTime() - Date.now();
  if (rem <= 0) return 'finalizing…';
  const m = Math.floor(rem / 60000);
  const s = Math.floor((rem % 60000) / 1000);
  return `${m}m ${s}s`;
}

function getUserLabel(user?: TradeOrder['user']): string {
  if (!user) return '—';
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name ? `${name} (${user.email})` : user.email;
}

// ── Component ──────────────────────────────────────────────────────────────

function FuturesListTable() {
  const tenantId = AuthCurrentTenant.get();

  const [orders, setOrders]   = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Per-row control state
  const [rowPct,     setRowPct]     = useState<Record<string, string>>({});
  const [rowControl, setRowControl] = useState<Record<string, ControlType | null>>({});
  const [rowDelay,   setRowDelay]   = useState<Record<string, string>>({});  // duration in minutes per row
  const [confirmRow, setConfirmRow] = useState<{ order: TradeOrder; control: ControlType; pct: number; delayMin: number } | null>(null);
  const [closingId,  setClosingId]  = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await authAxios.get(`/tenant/${tenantId}/admin/trade-orders`, { params });
      setOrders(data?.data?.rows ?? data?.rows ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0]?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [tenantId, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Silent auto-refresh + countdown tick ───────────────────────────────────
  // Keeps injection countdowns live and reflects orders that auto-close server-side.
  const [, setTick] = useState(0);
  useEffect(() => {
    const silentRefresh = async () => {
      if (!tenantId) return;
      try {
        const params: any = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        const { data } = await authAxios.get(`/tenant/${tenantId}/admin/trade-orders`, { params });
        setOrders(data?.data?.rows ?? data?.rows ?? []);
      } catch { /* ignore */ }
    };
    // 1 s tick for smooth countdown; refresh orders every 10 s
    let count = 0;
    const id = setInterval(() => {
      setTick(t => t + 1);
      count++;
      if (count % 10 === 0) silentRefresh();
    }, 1000);
    return () => clearInterval(id);
  }, [tenantId, statusFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectControl = (id: string, ctrl: ControlType) => {
    setRowControl(prev => ({ ...prev, [id]: prev[id] === ctrl ? null : ctrl }));
  };

  const handleOpenConfirm = (order: TradeOrder) => {
    const control  = rowControl[order.id];
    const pct      = parseFloat(rowPct[order.id] || '0');
    const delayRaw = rowDelay[order.id];
    const delay    = delayRaw !== undefined && delayRaw !== '' ? parseFloat(delayRaw) : 10;
    if (!control || isNaN(pct) || pct <= 0 || pct > 100) return;
    setConfirmRow({ order, control, pct, delayMin: isNaN(delay) ? 10 : Math.max(0, delay) });
  };

  const handleConfirmClose = async () => {
    if (!confirmRow || !tenantId) return;
    const { order, control, pct } = confirmRow;
    setConfirmRow(null);
    setClosingId(order.id);
    try {
      await authAxios.put(`/tenant/${tenantId}/admin/trade-orders/${order.id}/close`, {
        control,
        profitPercent: pct,
        delayMs: confirmRow.delayMin * 60_000,
      });
      // Reset row state
      setRowPct(prev     => { const n = { ...prev };     delete n[order.id]; return n; });
      setRowControl(prev => { const n = { ...prev };     delete n[order.id]; return n; });
      setRowDelay(prev   => { const n = { ...prev };     delete n[order.id]; return n; });
      await fetchOrders();
    } catch (e: any) {
      alert(e?.response?.data?.errors?.[0]?.message || 'Failed to close position');
    } finally {
      setClosingId(null);
    }
  };

  const handleCancel = async (order: TradeOrder) => {
    if (!tenantId) return;
    setCancellingId(order.id);
    try {
      await authAxios.put(`/tenant/${tenantId}/trade-orders/${order.id}/cancel`);
      await fetchOrders();
    } catch (e: any) {
      alert(e?.response?.data?.errors?.[0]?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{INLINE_CSS}</style>

      {/* ── Toolbar ── */}
      <div className="to-toolbar">
        <div className="to-filter-group">
          {['all', 'active', 'waiting', 'closed', 'cancelled'].map(s => (
            <button
              key={s}
              className={`to-filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button className="to-refresh-btn" onClick={fetchOrders} disabled={loading}>
          {loading ? <Spinner /> : '↻ Refresh'}
        </button>
      </div>

      {/* ── Error ── */}
      {error && <div className="to-error">{error}</div>}

      {/* ── Table ── */}
      <div className="spot-list-container">
        <div className="table-responsive">
          <table className="spot-list-table">
            <thead className="table-header">
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">User</th>
                <th className="table-th">Symbol</th>
                <th className="table-th">Type</th>
                <th className="table-th">Direction</th>
                <th className="table-th">Lots</th>
                <th className="table-th">Multiplier</th>
                <th className="table-th">Entry / Target</th>
                <th className="table-th">Close Price</th>
                <th className="table-th">Est. Margin</th>
                <th className="table-th">Status</th>
                <th className="table-th">P&amp;L</th>
                <th className="table-th">Opened</th>
                <th className="table-th">Closed</th>
                <th className="table-th to-control-th">Control</th>
              </tr>
            </thead>

            <tbody className="table-body">
              {loading && (
                <tr>
                  <td colSpan={15} className="loading-cell">
                    <div className="loading-container">
                      <Spinner />
                      <span className="loading-text">Loading orders…</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={15} className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-inbox no-data-icon" />
                      <p>No trade orders found</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && orders.map((order, idx) => {
                const pctRaw      = rowPct[order.id] || '';
                const pct         = parseFloat(pctRaw) || 0;
                const ctrl        = rowControl[order.id] ?? null;
                const delayRaw    = rowDelay[order.id] ?? '10';
                const delayVal    = parseFloat(delayRaw);
                const effMargin   = order.estimatedMargin ?? order.margin;
                const netPnl      = ctrl && pct > 0 ? calcNetPnl(effMargin, pct, ctrl) : null;
                const walletDiff  = netPnl;
                const canClose    = ctrl !== null && pct > 0 && pct <= 100;
                const isClosing  = closingId === order.id;
                const isCancelling = cancellingId === order.id;
                // Order has an active injection (chart animation running)
                const injActive  = !!order.injectionStartedAt && !!order.injectionDurationMs &&
                  (new Date(order.injectionStartedAt).getTime() + (order.injectionDurationMs || 0)) > Date.now();

                return (
                  <tr key={order.id} className={`table-row to-row-${order.status}`}>

                    {/* Index */}
                    <td className="table-cell to-idx">{idx + 1}</td>

                    {/* User */}
                    <td className="table-cell to-user">{getUserLabel(order.user)}</td>

                    {/* Symbol */}
                    <td className="table-cell">
                      <span className="to-symbol">{order.symbol}</span>
                    </td>

                    {/* Order type */}
                    <td className="table-cell">
                      <span className={`to-type-badge ${order.orderType}`}>{order.orderType}</span>
                    </td>

                    {/* Direction */}
                    <td className="table-cell">
                      <span className={`to-dir ${order.direction}`}>
                        {order.direction === 'buy' ? '▲ Buy' : '▼ Sell'}
                      </span>
                    </td>

                    {/* Lots */}
                    <td className="table-cell to-num">{order.lots}</td>

                    {/* Multiplier */}
                    <td className="table-cell to-num">{order.multiplier}×</td>

                    {/* Entry / Target price */}
                    <td className="table-cell to-num">
                      {order.status === 'waiting'
                        ? <span title="Trigger price" className="to-target">{fmtPrice(order.targetPrice)}</span>
                        : fmtPrice(order.entryPrice)
                      }
                    </td>

                    {/* Close Price */}
                    <td className="table-cell to-num">
                      {order.status === 'closed' && order.closePrice != null ? (
                        <span className={
                          order.pnl > 0 ? 'to-close-profit' :
                          order.pnl < 0 ? 'to-close-loss' : ''
                        }>
                          {fmtPrice(order.closePrice)}
                          <span className="to-close-badge">
                            {order.pnl > 0 ? ' ▲' : order.pnl < 0 ? ' ▼' : ''}
                          </span>
                        </span>
                      ) : '—'}
                    </td>

                    {/* Est. Margin */}
                    <td className="table-cell to-num">{fmtMoney(order.estimatedMargin ?? order.margin)}</td>

                    {/* Status */}
                    <td className="table-cell">
                      <span className={`to-status ${order.status}`}>{order.status}</span>
                    </td>

                    {/* P&L */}
                    <td className="table-cell to-num">
                      {order.pnl != null && order.pnl !== 0 ? (
                        <span className={order.pnl > 0 ? 'to-pnl-pos' : 'to-pnl-neg'}>
                          {order.pnl > 0 ? '+' : ''}{Number(order.pnl).toFixed(2)}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Opened */}
                    <td className="table-cell to-date">{fmtDate(order.openTime ?? order.createdAt)}</td>

                    {/* Closed */}
                    <td className="table-cell to-date">{fmtDate(order.closeTime)}</td>

                    {/* ── Control column ── */}
                    <td className="actions-cell">

                      {/* ACTIVE + injection running: show live animation status */}
                      {order.status === 'active' && injActive && (
                        <div className="ctrl-panel">
                          <div className="to-inject-info">
                            <span className="to-inject-badge">
                              <span className="to-inject-dot" /> Chart Animating
                            </span>
                            <span className="to-inject-timer">{fmtCountdown(
                              order.injectionStartedAt && order.injectionDurationMs
                                ? new Date(new Date(order.injectionStartedAt).getTime() + order.injectionDurationMs).toISOString()
                                : undefined
                            )}</span>
                          </div>
                          <div className="to-inject-target">
                            Target&nbsp;
                            <strong style={{ color: (order.pnl ?? order.injectionTargetPrice ?? 0) >= (order.entryPrice ?? 0) ? 'var(--success)' : 'var(--danger)' }}>
                              {fmtPrice(order.injectionTargetPrice)}
                            </strong>
                          </div>
                          <div className="to-inject-note">
                            Customer can close anytime · auto-closes when timer ends
                          </div>
                        </div>
                      )}

                      {/* ACTIVE (no injection): show profit/loss + duration controls */}
                      {order.status === 'active' && !injActive && (
                        <div className="ctrl-panel">

                          {/* Row 1: % input + Profit / Loss buttons */}
                          <div className="ctrl-row">
                            <div className="pct-input-wrap">
                              <input
                                type="number"
                                min="0" max="100" step="0.1"
                                placeholder="0"
                                value={pctRaw}
                                onChange={(e) =>
                                  setRowPct(prev => ({ ...prev, [order.id]: e.target.value }))
                                }
                                className="pct-input"
                              />
                              <span className="pct-symbol">%</span>
                            </div>

                            <button
                              type="button"
                              className={`ctrl-btn profit${ctrl === 'profit' ? ' selected' : ''}`}
                              onClick={() => handleSelectControl(order.id, 'profit')}
                            >
                              Profit
                            </button>
                            <button
                              type="button"
                              className={`ctrl-btn loss${ctrl === 'loss' ? ' selected' : ''}`}
                              onClick={() => handleSelectControl(order.id, 'loss')}
                            >
                              Loss
                            </button>
                          </div>

                          {/* Row 2: Duration */}
                          <div className="ctrl-row">
                            <span className="dur-label">Duration</span>
                            <div className="dur-input-wrap">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="10"
                                value={delayRaw}
                                onChange={(e) =>
                                  setRowDelay(prev => ({ ...prev, [order.id]: e.target.value }))
                                }
                                className="dur-input"
                              />
                              <span className="pct-symbol">min</span>
                            </div>
                            <span className="dur-hint">
                              {!isNaN(delayVal) && delayVal > 0
                                ? `~${delayVal}m chart`
                                : delayRaw === '0' ? 'instant' : ''}
                            </span>
                          </div>

                          {/* Preview */}
                          {ctrl && pct > 0 && netPnl !== null && (
                            <div className={`ctrl-preview ${ctrl}`}>
                              <span className="preview-icon">{ctrl === 'profit' ? '📈' : '📉'}</span>
                              <span>
                                {ctrl === 'profit' ? (
                                  <>P&L&nbsp;<strong className="preview-profit">+{fmtMoney(netPnl)}</strong>
                                  &nbsp;·&nbsp;Wallet&nbsp;<strong className="preview-profit">+{fmtMoney(walletDiff!)}</strong></>
                                ) : (
                                  <>P&L&nbsp;<strong className="preview-loss">-{fmtMoney(Math.abs(netPnl))}</strong>
                                  &nbsp;·&nbsp;Wallet&nbsp;<strong className="preview-loss">-{fmtMoney(Math.abs(walletDiff!))}</strong></>
                                )}
                              </span>
                            </div>
                          )}

                          {/* Apply button */}
                          <button
                            type="button"
                            className="ctrl-close-btn"
                            onClick={() => handleOpenConfirm(order)}
                            disabled={!canClose || isClosing}
                          >
                            {isClosing ? 'Applying…' : 'Apply'}
                          </button>
                        </div>
                      )}

                      {/* WAITING: show Cancel button */}
                      {order.status === 'waiting' && (
                        <div className="ctrl-panel">
                          <div className="to-waiting-info">
                            <span className="to-waiting-label">
                              {order.triggerAbove ? '⬆ Trigger above' : '⬇ Trigger below'}
                            </span>
                            <span className="to-waiting-price">{fmtPrice(order.targetPrice)}</span>
                          </div>
                          <button
                            type="button"
                            className="ctrl-cancel-btn"
                            onClick={() => handleCancel(order)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? 'Cancelling…' : 'Cancel Order'}
                          </button>
                        </div>
                      )}

                      {/* CLOSED / CANCELLED: show result badge */}
                      {(order.status === 'closed' || order.status === 'cancelled') && (
                        <div className="fin-badge-wrap">
                          <span className={`fin-badge ${order.status === 'cancelled' ? 'cancelled' : order.pnl >= 0 ? 'profit' : 'loss'}`}>
                            {order.status === 'cancelled'
                              ? 'Cancelled'
                              : order.pnl >= 0 ? '✓ Profit' : '✗ Loss'}
                          </span>
                          {order.status === 'closed' && order.pnl != null && (
                            <span className={`fin-pnl ${order.pnl >= 0 ? 'profit' : 'loss'}`}>
                              {order.pnl > 0 ? '+' : ''}{Number(order.pnl).toFixed(2)} USDT
                            </span>
                          )}
                          {order.closeReason && order.closeReason !== 'manual' && (
                            <span className="to-close-reason">{order.closeReason.toUpperCase()}</span>
                          )}
                          {/* Injection still animating after an early customer close */}
                          {order.status === 'closed' && injActive && (
                            <span className="to-inject-badge" style={{ marginTop: 4 }}>
                              <span className="to-inject-dot" /> Chart still animating&nbsp;
                              {fmtCountdown(
                                order.injectionStartedAt && order.injectionDurationMs
                                  ? new Date(new Date(order.injectionStartedAt).getTime() + order.injectionDurationMs).toISOString()
                                  : undefined
                              )}
                            </span>
                          )}
                        </div>
                      )}

                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirm Close Modal ── */}
      {confirmRow && (
        <div className="cp-modal-overlay" onClick={() => setConfirmRow(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-title">
              {confirmRow.delayMin === 0 ? 'Confirm Close Position' : 'Confirm Chart Animation'}
            </div>
            <div className="cp-modal-body">
              <div className="cp-modal-row">
                <span>User</span>
                <strong>{getUserLabel(confirmRow.order.user)}</strong>
              </div>
              <div className="cp-modal-row">
                <span>Symbol</span>
                <strong>{confirmRow.order.symbol}</strong>
              </div>
              <div className="cp-modal-row">
                <span>Direction</span>
                <strong className={confirmRow.order.direction === 'buy' ? 'preview-profit' : 'preview-loss'}>
                  {confirmRow.order.direction === 'buy' ? '▲ Buy' : '▼ Sell'}
                </strong>
              </div>
              <div className="cp-modal-row">
                <span>Est. Margin</span>
                <strong>{fmtMoney(confirmRow.order.estimatedMargin ?? confirmRow.order.margin)}</strong>
              </div>
              <div className="cp-modal-row">
                <span>Percentage</span>
                <strong>{confirmRow.pct}%</strong>
              </div>
              <div className="cp-modal-row">
                <span>Duration</span>
                <div className="cp-dur-wrap">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="cp-dur-input"
                    value={confirmRow.delayMin}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setConfirmRow(prev => prev
                        ? { ...prev, delayMin: isNaN(v) ? 0 : Math.max(0, v) }
                        : prev
                      );
                    }}
                  />
                  <span className="cp-dur-unit">min</span>
                  {confirmRow.delayMin === 0 && (
                    <span className="cp-dur-badge instant">Instant</span>
                  )}
                </div>
              </div>
              <div className="cp-modal-row">
                <span>Close Price</span>
                <strong className={confirmRow.control === 'profit' ? 'preview-profit' : 'preview-loss'}>
                  {fmtPrice(calcPredictedClosePrice(confirmRow.order, confirmRow.pct, confirmRow.control))}
                </strong>
              </div>
              <div className="cp-modal-row">
                <span>Net P&amp;L</span>
                <strong className={confirmRow.control === 'profit' ? 'preview-profit' : 'preview-loss'}>
                  {confirmRow.control === 'profit' ? '+' : '-'}
                  {fmtMoney(calcNetPnl(confirmRow.order.estimatedMargin ?? confirmRow.order.margin, confirmRow.pct, confirmRow.control))}
                </strong>
              </div>
              <div className="cp-modal-row">
                <span>Wallet change</span>
                <strong className={confirmRow.control === 'profit' ? 'preview-profit' : 'preview-loss'}>
                  {confirmRow.control === 'profit' ? '+' : '-'}
                  {fmtMoney(Math.abs(calcNetPnl(confirmRow.order.estimatedMargin ?? confirmRow.order.margin, confirmRow.pct, confirmRow.control)))} USDT
                </strong>
              </div>
            </div>
            <div className="cp-modal-footer">
              <button className="cp-btn-cancel" onClick={() => setConfirmRow(null)}>Cancel</button>
              <button
                className={`cp-btn-confirm ${confirmRow.control}`}
                onClick={handleConfirmClose}
              >
                {confirmRow.delayMin === 0
                  ? `Close Now — ${confirmRow.control === 'profit' ? 'Profit' : 'Loss'}`
                  : `Schedule ${confirmRow.delayMin % 1 === 0 ? confirmRow.delayMin : confirmRow.delayMin.toFixed(1)}min — ${confirmRow.control === 'profit' ? 'Profit' : 'Loss'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── CSS ────────────────────────────────────────────────────────────────────

const INLINE_CSS = `
  /* Toolbar */
  .to-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 4px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .to-filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
  .to-filter-btn {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid var(--border-strong);
    background: var(--surface);
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .to-filter-btn:hover { border-color: var(--accent); color: var(--accent-text); }
  .to-filter-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .to-refresh-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid var(--border-strong);
    background: var(--surface);
    color: var(--text-2);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .to-refresh-btn:hover:not(:disabled) { background: var(--hover); }
  .to-refresh-btn:disabled { opacity: 0.5; }

  .to-error {
    background: var(--danger-soft);
    border: 1px solid var(--danger-border);
    color: var(--danger);
    padding: 10px 16px;
    border-radius: 8px;
    margin: 8px 16px;
    font-size: 13px;
  }

  /* Column widths */
  .to-control-th { min-width: 270px; }
  .to-idx  { width: 36px; text-align: center; color: var(--text-muted); font-size: 12px; }
  .to-user { font-size: 12px; color: var(--text); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .to-num  { font-family: monospace; font-size: 13px; }
  .to-date { font-size: 11px; color: var(--text-muted); white-space: nowrap; }

  /* Symbol badge */
  .to-symbol {
    font-weight: 700;
    font-size: 13px;
    color: var(--text);
    letter-spacing: 0.3px;
  }

  /* Order type badge */
  .to-type-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .to-type-badge.market  { background: var(--success-soft); color: var(--success); border: 1px solid var(--success-border); }
  .to-type-badge.pending { background: var(--warning-soft); color: var(--warning); border: 1px solid var(--warning-border); }

  /* Direction */
  .to-dir { font-weight: 700; font-size: 13px; }
  .to-dir.buy  { color: var(--success); }
  .to-dir.sell { color: var(--danger); }

  /* Status badge */
  .to-status {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    display: inline-block;
  }
  .to-status.active    { background: var(--accent-soft);  color: var(--accent-text); border: 1px solid var(--accent-border); }
  .to-status.waiting   { background: var(--warning-soft);  color: var(--warning); border: 1px solid var(--warning-border); }
  .to-status.closed    { background: var(--surface-3); color: var(--text-muted);    border: 1px solid var(--border-strong); }
  .to-status.cancelled { background: var(--danger-soft);    color: var(--danger); border: 1px solid var(--danger-border); }
  @keyframes closingPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }

  /* Row tinting by status */
  .to-row-active    { background: var(--accent-soft); }
  .to-row-waiting   { background: var(--warning-soft); }
  .to-row-closed    { opacity: 0.8; }
  .to-row-cancelled { opacity: 0.55; }

  /* Price arrows */
  .to-target       { color: var(--warning); font-weight: 600; }
  .to-close-arrow  { color: var(--text-muted); font-size: 12px; }
  .to-close-profit { color: var(--success); font-weight: 700; font-size: 13px; }
  .to-close-loss   { color: var(--danger); font-weight: 700; font-size: 13px; }
  .to-close-badge  { font-size: 10px; }

  /* P&L */
  .to-pnl-pos { color: var(--success); font-weight: 700; }
  .to-pnl-neg { color: var(--danger); font-weight: 700; }

  /* Finalized result */
  .fin-badge-wrap { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
  .fin-badge {
    font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 6px; text-transform: uppercase; letter-spacing: 0.3px;
  }
  .fin-badge.profit    { background: var(--success-soft);  color: var(--success); border: 1px solid var(--success-border); }
  .fin-badge.loss      { background: var(--danger-soft);  color: var(--danger); border: 1px solid var(--danger-border); }
  .fin-badge.cancelled { background: var(--surface-3); color: var(--text-muted);   border: 1px solid var(--border-strong); }
  .fin-pnl { font-size: 12px; font-weight: 600; }
  .fin-pnl.profit { color: var(--success); }
  .fin-pnl.loss   { color: var(--danger); }
  .to-close-reason {
    font-size: 9px; font-weight: 700; padding: 2px 6px;
    border-radius: 4px; background: var(--surface-3); color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.3px;
  }

  /* Waiting info */
  .to-waiting-info  { display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px; }
  .to-waiting-label { font-size: 11px; color: var(--text-muted); }
  .to-waiting-price { font-size: 14px; font-weight: 700; color: var(--warning); }

  /* Injection (chart animation) status */
  .to-inject-info   { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
  .to-inject-badge  { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: var(--orange);
                      background: var(--orange-soft); border: 1px solid var(--orange);
                      border-radius: 6px; padding: 3px 8px; }
  .to-inject-dot    { width: 7px; height: 7px; border-radius: 50%; background: var(--orange);
                      animation: closingPulse 1.2s ease-in-out infinite; }
  .to-inject-timer  { font-size: 14px; font-weight: 700; color: var(--orange); font-family: monospace; }
  .to-inject-target { font-size: 13px; color: var(--text-muted); }
  .to-inject-note   { font-size: 10px; color: var(--text-muted); line-height: 1.4; }

  /* ── Control panel ── */
  .ctrl-panel { display: flex; flex-direction: column; gap: 8px; }

  .ctrl-row { display: flex; align-items: center; gap: 6px; }

  .pct-input-wrap {
    display: flex;
    align-items: center;
    background: var(--input-bg);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .pct-input {
    width: 56px;
    background: transparent;
    border: none;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    padding: 5px 8px;
    outline: none;
    -moz-appearance: textfield;
  }
  .pct-input::-webkit-inner-spin-button,
  .pct-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .pct-symbol { padding: 5px 8px 5px 0; color: var(--text-muted); font-size: 13px; font-weight: 600; user-select: none; }

  .ctrl-btn {
    flex: 1;
    padding: 6px 8px;
    border-radius: 6px;
    border: 1.5px solid transparent;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    letter-spacing: 0.2px;
  }
  .ctrl-btn.profit { background: var(--success-soft); color: var(--success); border-color: var(--success-border); }
  .ctrl-btn.profit:hover, .ctrl-btn.profit.selected { background: var(--success); color: #fff; border-color: var(--success); }
  .ctrl-btn.loss   { background: var(--danger-soft); color: var(--danger); border-color: var(--danger-border); }
  .ctrl-btn.loss:hover, .ctrl-btn.loss.selected { background: var(--danger); color: #fff; border-color: var(--danger); }

  .ctrl-preview {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.4;
  }
  .ctrl-preview.profit { background: var(--success-soft);  border: 1px solid var(--success-border);  color: var(--text-2); }
  .ctrl-preview.loss   { background: var(--danger-soft);  border: 1px solid var(--danger-border);  color: var(--text-2); }
  .preview-icon   { font-size: 14px; }
  .preview-profit { color: var(--success); }
  .preview-loss   { color: var(--danger); }

  .ctrl-close-btn {
    width: 100%;
    padding: 8px 14px;
    border-radius: 6px;
    border: none;
    background: var(--accent);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;
    letter-spacing: 0.2px;
  }
  .ctrl-close-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .ctrl-close-btn:disabled { opacity: 0.35; cursor: default; }

  .ctrl-cancel-btn {
    width: 100%;
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid var(--danger-border);
    background: var(--danger-soft);
    color: var(--danger);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }
  .ctrl-cancel-btn:hover:not(:disabled) { background: var(--danger-soft); }
  .ctrl-cancel-btn:disabled { opacity: 0.4; cursor: default; }

  /* ── Confirm modal ── */
  .cp-modal-overlay {
    position: fixed; inset: 0;
    background: var(--overlay);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    animation: cpFadeIn 0.15s ease;
  }
  .cp-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    width: 100%; max-width: 400px;
    padding: 24px;
    box-shadow: var(--shadow-lg);
    animation: cpSlideUp 0.2s ease;
  }
  .cp-modal-title {
    font-size: 17px; font-weight: 700; color: var(--text);
    margin-bottom: 20px; text-align: center;
  }
  .cp-modal-body  { display: flex; flex-direction: column; gap: 0; margin-bottom: 24px; }
  .cp-modal-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 14px; color: var(--text-muted);
    padding: 11px 0; border-bottom: 1px solid var(--border);
  }
  .cp-modal-row:last-child { border-bottom: none; }
  .cp-modal-row strong { color: var(--text); }
  .cp-delay-select {
    background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: 6px;
    color: var(--text); font-size: 13px; font-weight: 600; padding: 4px 10px;
    cursor: pointer; outline: none;
  }
  .cp-delay-select:focus { border-color: var(--accent); }
  .cp-modal-footer { display: flex; gap: 10px; }
  .cp-btn-cancel {
    flex: 1; padding: 11px; border-radius: 8px;
    border: 1px solid var(--border-strong); background: var(--surface-3);
    color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer;
    transition: background 0.15s;
  }
  .cp-btn-cancel:hover { background: var(--hover); }
  .cp-btn-confirm {
    flex: 2; padding: 11px; border-radius: 8px;
    border: none; font-size: 14px; font-weight: 700; cursor: pointer;
    transition: opacity 0.15s;
  }
  .cp-btn-confirm.profit { background: var(--success); color: #fff; }
  .cp-btn-confirm.profit:hover { opacity: 0.9; }
  .cp-btn-confirm.loss   { background: var(--danger); color: #fff; }
  .cp-btn-confirm.loss:hover   { opacity: 0.9; }

  @keyframes cpFadeIn  { from { opacity: 0; }              to { opacity: 1; } }
  @keyframes cpSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* Table overrides for new column */
  .table-th { padding: 10px 12px; font-size: 12px; color: var(--text-muted); text-align: left; white-space: nowrap; border-bottom: 1px solid var(--border); }

  /* ── Duration input (ctrl-panel row) ── */
  .dur-label { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
  .dur-input-wrap {
    display: flex; align-items: center;
    background: var(--input-bg); border: 1px solid var(--border-strong); border-radius: 6px;
    overflow: hidden; flex-shrink: 0;
  }
  .dur-input {
    width: 50px; background: transparent; border: none;
    color: var(--text); font-size: 13px; font-weight: 600;
    padding: 5px 6px; outline: none;
    -moz-appearance: textfield;
  }
  .dur-input::-webkit-inner-spin-button,
  .dur-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .dur-hint { font-size: 10px; color: var(--accent-text); font-weight: 600; margin-left: 4px; }

  /* ── Duration input (confirm modal) ── */
  .cp-dur-wrap  { display: flex; align-items: center; gap: 6px; }
  .cp-dur-input {
    width: 64px; padding: 4px 8px;
    background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: 6px;
    color: var(--text); font-size: 14px; font-weight: 700; outline: none;
    -moz-appearance: textfield;
  }
  .cp-dur-input::-webkit-inner-spin-button,
  .cp-dur-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .cp-dur-input:focus { border-color: var(--accent); }
  .cp-dur-unit  { color: var(--text-muted); font-size: 13px; }
  .cp-dur-badge {
    font-size: 10px; font-weight: 700; padding: 2px 7px;
    border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px;
  }
  .cp-dur-badge.instant { background: var(--accent-soft); color: var(--accent-text); }
`;

export default FuturesListTable;
