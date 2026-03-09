import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Recording from "./pages/Recording";
import Transcription from "./pages/Transcription";
import Output from "./pages/Output";
import "./index.css";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [screen, setScreen]               = useState("login");
  const [recordingData, setRecordingData] = useState(null);

  // Sync auth state → screen
  useEffect(() => {
    if (isAuthenticated && screen === "login") setScreen("dashboard");
    if (!isAuthenticated) setScreen("login");
  }, [isAuthenticated]);

  const navigate = (s) => setScreen(s);

  // Unauthenticated → always show Login
  if (!isAuthenticated) {
    return <Login onNavigate={navigate} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar onNavigate={navigate} />
      <main>
        <ProtectedRoute onNavigate={navigate}>
          {screen === "dashboard"    && <Dashboard    onNavigate={navigate} setRecordingData={setRecordingData} />}
          {screen === "recording"    && <Recording    onNavigate={navigate} setRecordingData={setRecordingData} />}
          {screen === "transcription"&& <Transcription onNavigate={navigate} recordingData={recordingData} />}
          {screen === "output"       && <Output        onNavigate={navigate} recordingData={recordingData} />}
        </ProtectedRoute>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}