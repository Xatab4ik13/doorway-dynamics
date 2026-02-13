import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw, LogOut } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class DashboardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Dashboard error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: "hsl(220, 25%, 97%)", fontFamily: "Inter, sans-serif" }}
        >
          <div
            className="max-w-md w-full rounded-2xl p-8 text-center space-y-4"
            style={{ backgroundColor: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
          >
            <AlertCircle size={48} style={{ color: "hsl(0, 84%, 60%)" }} className="mx-auto" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "hsl(222, 47%, 11%)" }}>
              Ошибка загрузки
            </h2>
            <p style={{ fontSize: "0.875rem", color: "hsl(215, 16%, 47%)" }}>
              {this.state.error?.message || "Произошла непредвиденная ошибка"}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.625rem 1.25rem", borderRadius: "0.75rem",
                  backgroundColor: "hsl(221, 83%, 53%)", color: "white",
                  fontSize: "0.875rem", fontWeight: 500, border: "none", cursor: "pointer",
                }}
              >
                <RefreshCw size={16} /> Обновить
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.625rem 1.25rem", borderRadius: "0.75rem",
                  backgroundColor: "transparent", color: "hsl(215, 16%, 47%)",
                  fontSize: "0.875rem", fontWeight: 500, border: "1px solid hsl(214, 32%, 91%)", cursor: "pointer",
                }}
              >
                <LogOut size={16} /> Выйти
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default DashboardErrorBoundary;
