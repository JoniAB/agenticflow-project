import { useAuth } from "../context/AuthContext";

export function Login() {
  const { users, login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏢</div>
          <h1 className="text-2xl font-bold text-slate-800">שקיפות כספית — ועד בית</h1>
          <p className="text-slate-500 mt-2 text-sm">
            בחרו חשבון כדי להתחבר. התפקיד (ועד / אדמין) קבוע מראש לכל חשבון.
          </p>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => login(user.id)}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3.5 text-right hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium text-slate-800">{user.name}</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role === "admin" ? "אדמין" : "ועד בית"}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          גרסת פרוטוטייפ — הנתונים נשמרים באופן זמני בדפדפן בלבד
        </p>
      </div>
    </div>
  );
}
