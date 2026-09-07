import { useAuth } from "../context/AuthContext";

export function TopBar() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return null;

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏢</span>
          <span className="font-bold text-slate-800">שקיפות כספית — ועד בית</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{currentUser.name}</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              currentUser.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {currentUser.role === "admin" ? "אדמין" : "ועד בית"}
          </span>
          <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-600">
            התנתקות
          </button>
        </div>
      </div>
    </header>
  );
}
