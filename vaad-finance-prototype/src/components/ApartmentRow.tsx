import { useState } from "react";
import type { Apartment } from "../types";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../utils/format";
import { Modal } from "./Modal";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ApartmentRow({ apartment }: { apartment: Apartment }) {
  const { addPayment, updateResidentInfo, removeApartment } = useAppData();
  const { currentUser } = useAuth();
  const canManagePayments = currentUser?.role === "committee" || currentUser?.role === "admin";
  const isAdmin = currentUser?.role === "admin";

  const [expanded, setExpanded] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("350");
  const [paymentDate, setPaymentDate] = useState(todayIso());
  const [paymentNote, setPaymentNote] = useState("");

  const [editingResident, setEditingResident] = useState(false);
  const [name, setName] = useState(apartment.residentName);
  const [phone, setPhone] = useState(apartment.phone);
  const [email, setEmail] = useState(apartment.email);

  const [confirmRemove, setConfirmRemove] = useState(false);

  const savePayment = () => {
    const amount = Number(paymentAmount);
    if (Number.isNaN(amount) || amount <= 0 || !paymentDate) return;
    addPayment(apartment.id, amount, paymentDate, paymentNote.trim() || "תשלום");
    setPaymentAmount("350");
    setPaymentDate(todayIso());
    setPaymentNote("");
    setAddingPayment(false);
  };

  const saveResident = () => {
    updateResidentInfo(apartment.id, { residentName: name, phone, email });
    setEditingResident(false);
  };

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-4 py-3 font-semibold text-slate-700">{apartment.id}</td>
        <td className="px-4 py-3 text-slate-700">{apartment.residentName || "—"}</td>
        <td className="px-4 py-3 text-slate-500 tabular-nums">{apartment.phone || "—"}</td>
        <td className="px-4 py-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              apartment.status === "שולם"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {apartment.status}
          </span>
        </td>
        <td className="px-4 py-3 tabular-nums text-slate-700">
          {apartment.debtAmount > 0 ? formatCurrency(apartment.debtAmount) : "₪0"}
        </td>
        <td className="px-4 py-3 text-slate-400 w-8">
          <span className={`inline-block transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-slate-50/70">
          <td colSpan={6} className="px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="text-sm text-slate-500">
                {apartment.email && <span>{apartment.email}</span>}
              </div>
              <div className="flex gap-2">
                {canManagePayments && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddingPayment(true);
                    }}
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    + הוסף תשלום
                  </button>
                )}
                {isAdmin && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingResident(true);
                      }}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      עריכת פרטי דייר
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmRemove(true);
                      }}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      הסר דירה
                    </button>
                  </>
                )}
              </div>
            </div>

            {apartment.paymentHistory.length === 0 ? (
              <p className="text-sm text-slate-400">אין עדיין היסטוריית תשלומים</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs">
                    <th className="text-right font-medium py-1.5">תאריך</th>
                    <th className="text-right font-medium py-1.5">סכום</th>
                    <th className="text-right font-medium py-1.5">הערה</th>
                  </tr>
                </thead>
                <tbody>
                  {apartment.paymentHistory.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-1.5 text-slate-600">{formatDate(p.date)}</td>
                      <td className="py-1.5 text-slate-700 tabular-nums">{formatCurrency(p.amount)}</td>
                      <td className="py-1.5 text-slate-500">{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}

      {addingPayment && (
        <Modal title={`הוספת תשלום — דירה ${apartment.id}`} onClose={() => setAddingPayment(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">תאריך</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">סכום (₪)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">הערה / אמצעי תשלום</label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="לדוגמה: העברה בנקאית"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={() => setAddingPayment(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
            >
              ביטול
            </button>
            <button
              onClick={savePayment}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
            >
              שמירה
            </button>
          </div>
        </Modal>
      )}

      {editingResident && (
        <Modal title={`עריכת פרטי דייר — דירה ${apartment.id}`} onClose={() => setEditingResident(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">שם</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">טלפון</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">מייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={() => setEditingResident(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
            >
              ביטול
            </button>
            <button
              onClick={saveResident}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
            >
              שמירה
            </button>
          </div>
        </Modal>
      )}

      {confirmRemove && (
        <Modal title="הסרת דירה" onClose={() => setConfirmRemove(false)}>
          <p className="text-sm text-slate-600 mb-4">
            להסיר את דירה {apartment.id} ({apartment.residentName || "ללא דייר"}) מהטבלה? הפעולה אינה
            הפיכה.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmRemove(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
            >
              ביטול
            </button>
            <button
              onClick={() => {
                removeApartment(apartment.id);
                setConfirmRemove(false);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm font-semibold"
            >
              הסרה
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
