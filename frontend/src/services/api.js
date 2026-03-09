import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err.response?.data || err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginUser = (email, password) =>
  api.post("/auth/login", { email, password });

// ── Audio ─────────────────────────────────────────────────────────────────────
export const uploadAudio = (audioBlob, patientName) => {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");
  form.append("patientName", patientName);
  return api.post("/audio/upload", form);
};

export const getRecordings = () => api.get("/audio");

// ── Transcription ─────────────────────────────────────────────────────────────
// Polls every 3 seconds until transcription is ready
export const getTranscription = async (audioId) => {
  const MAX_POLLS = 40;        // 40 × 3s = 2 minutes max
  const INTERVAL  = 3000;

  for (let i = 0; i < MAX_POLLS; i++) {
    const res = await api.get(`/transcription/${audioId}`);

    // 200 = ready, 202 = still processing
    if (res.status === 200) return res;

    await new Promise((r) => setTimeout(r, INTERVAL));
  }

  throw new Error("Transcription is taking too long. Please refresh and try again.");
};

export const saveTranscription = (audioId, text, summary, instructions) =>
  api.put(`/transcription/${audioId}`, { text, summary, instructions });

export const approveTranscription = (audioId) =>
  api.post(`/transcription/${audioId}/approve`);

export const getOutput = (audioId) =>
  api.get(`/transcription/${audioId}/output`);

export default api;