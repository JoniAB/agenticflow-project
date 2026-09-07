import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../utils/format";
import { Modal } from "./Modal";

export function BalanceHeader() {
  const { balance, updateBalance } = useAppData();
  const { currentUser } = useAuth();
  const canEdit = currentUser?.role === "committee" || currentUser?.role === "admin";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(balance.amount));

  const openEdit = () => {
    setDraft(String(balance.amount));
    setEditing(true);
  };

  const save = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed)) return;
    updateBalance(parsed);
    setEditing(false);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-slate-500 text-sm mb-1">💰 יתרת קופת הוועד הנוכחית</p>
        <p className="text-4xl md:text-5xl font-extrabold text-slate-800 tabular-nums">
          {formatCurrency(balance.amount)}
        </p>
        <p className="text-slate-400 text-xs mt-2">עודכן לאחרונה: {formatDate(balance.lastUpdated)}</p>
      </div>
      {canEdit && (
        <button
          onClick={openEdit}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          עדכון יתרה
        </button>
      )}

      {editing && (
        <Modal title="עדכון יתרת קופה" onClose={() => setEditing(false)}>
          <label className="block text-sm text-slate-600 mb-1">סכום חדש (₪)</label>
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
            >
              ביטול
            </button>
            <button
              onClick={save}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
            >
              שמירה
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
