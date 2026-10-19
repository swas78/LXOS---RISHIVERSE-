import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api/v1";

export const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

// DEV actor shim: attach the impersonated core `User.referenceId` (enrollmentNo
// for students, employeeId for employees) so the backend's lxActor middleware
// can resolve the acting member.
//
// In RishiVerse this whole interceptor goes away — the host attaches the real
// JWT and `authenticate` populates req.user. See middleware/lxActor.js.
export const LX_ACTOR_STORAGE_KEY = "lx-actor-ref";
export const LX_ACTOR_HEADER = "x-lx-actor-ref";

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        try {
            const actorRef = window.localStorage.getItem(LX_ACTOR_STORAGE_KEY);
            if (actorRef) {
                config.headers = config.headers ?? {};
                config.headers[LX_ACTOR_HEADER] = actorRef;
            }
        } catch {
            // localStorage unavailable — fall back to the backend's default actor.
        }
    }
    return config;
});

export default api;
