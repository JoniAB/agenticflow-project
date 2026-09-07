import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { ApartmentRow } from "./ApartmentRow";

export function ApartmentsTable() {
  const { apartments, addApartment } = useAppData();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [query, setQuery] = useState("");

  const filtered = apartments.filter((apt) => {
    if (!query.trim()) return true;
    const q = query.trim();
    return (
      String(apt.id).includes(q) ||
      apt.residentName.toLowerCase().includes(q.toLowerCase())
    );
  });

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-slate-800">טבלת דירות</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי מספר דירה או שם"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {isAdmin && (
            <button
              onClick={addApartment}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
            >
              + הוספת דירה
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-xs border-b border-slate-200">
              <th className="text-right font-medium px-4 py-2">מס' דירה</th>
              <th className="text-right font-medium px-4 py-2">דייר</th>
              <th className="text-right font-medium px-4 py-2">טלפון</th>
              <th className="text-right font-medium px-4 py-2">סטטוס</th>
              <th className="text-right font-medium px-4 py-2">חוב</th>
              <th className="text-right font-medium px-4 py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((apt) => (
              <ApartmentRow key={apt.id} apartment={apt} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">לא נמצאו דירות תואמות</p>
        )}
      </div>
    </section>
  );
}
