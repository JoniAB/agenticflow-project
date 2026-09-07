import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";
import { Modal } from "./Modal";
import type { Category } from "../types";

const BAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
];

export function CategoriesSection() {
  const { categories, updateCategoryAmount, addCategory, removeCategory } = useAppData();
  const { currentUser } = useAuth();
  const canEditAmounts = currentUser?.role === "committee" || currentUser?.role === "admin";
  const isAdmin = currentUser?.role === "admin";

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draftAmount, setDraftAmount] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const maxSpent = Math.max(1, ...categories.map((c) => c.totalSpent));

  const openEdit = (category: Category) => {
    if (!canEditAmounts) return;
    setEditingCategory(category);
    setDraftAmount(String(category.totalSpent));
  };

  const saveAmount = () => {
    if (!editingCategory) return;
    const parsed = Number(draftAmount);
    if (Number.isNaN(parsed) || parsed < 0) return;
    updateCategoryAmount(editingCategory.id, parsed);
    setEditingCategory(null);
  };

  const saveNewCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    addCategory(name);
    setNewCategoryName("");
    setAddingCategory(false);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800">הוצאות לפי קטגוריה</h2>
        {isAdmin && (
          <button
            onClick={() => setAddingCategory(true)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            + קטגוריה חדשה
          </button>
        )}
      </div>

      <div className="flex items-end gap-4 md:gap-6 overflow-x-auto pb-2">
        {categories.map((category, i) => {
          const heightPct = Math.max(6, (category.totalSpent / maxSpent) * 100);
          return (
            <div key={category.id} className="flex flex-col items-center gap-2 min-w-[84px]">
              <div className="relative h-40 w-14 flex items-end bg-slate-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => openEdit(category)}
                  disabled={!canEditAmounts}
                  title={canEditAmounts ? "לחצו לעדכון סכום" : undefined}
                  className={`w-full rounded-t-lg transition-all ${BAR_COLORS[i % BAR_COLORS.length]} ${
                    canEditAmounts ? "cursor-pointer hover:opacity-80" : "cursor-default"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-slate-700 tabular-nums">
                {formatCurrency(category.totalSpent)}
              </p>
              <p className="text-xs text-slate-500 text-center">{category.name}</p>
              {isAdmin && (
                <button
                  onClick={() => removeCategory(category.id)}
                  className="text-[11px] text-rose-500 hover:text-rose-700"
                >
                  הסר קטגוריה
                </button>
              )}
            </div>
          );
        })}
      </div>

      {editingCategory && (
        <Modal title={`עדכון סכום — ${editingCategory.name}`} onClose={() => setEditingCategory(null)}>
          <label className="block text-sm text-slate-600 mb-1">סכום שהוצא (₪)</label>
          <input
            type="number"
            value={draftAmount}
            onChange={(e) => setDraftAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditingCategory(null)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
            >
              ביטול
            </button>
            <button
              onClick={saveAmount}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
            >
              שמירה
            </button>
          </div>
        </Modal>
      )}

      {addingCategory && (
        <Modal title="קטגוריית הוצאה חדשה" onClose={() => setAddingCategory(false)}>
          <label className="block text-sm text-slate-600 mb-1">שם הקטגוריה</label>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setAddingCategory(false)}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm"
            >
              ביטול
            </button>
            <button
              onClick={saveNewCategory}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
            >
              הוספה
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
