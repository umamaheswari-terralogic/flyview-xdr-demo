// In development: VITE_API_URL=http://localhost:3001  (set in .env.local)
// In production:  VITE_API_URL is empty → calls go to same origin (/api/...)
export const API_BASE = import.meta.env.VITE_API_URL ?? ''
