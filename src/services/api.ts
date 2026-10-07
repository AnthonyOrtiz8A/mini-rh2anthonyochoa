// src/services/api.ts
import axios from 'axios';
import { notifyGlobalError } from '../utils/errorHandler';

// API mock local (JSON Server) para el CRUD de empleados de este mini-proyecto.
// No requiere autenticación: la sesión real contra API-RH vive por separado
// en authApi.ts / authService.ts (Clase 9), con su propio interceptor.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Errores de infraestructura (red caída, 5xx): un toast global por todas las peticiones.
// Los errores de cada operación (400, 404...) los muestra cada hook con handleError.
apiClient.interceptors.response.use(
(response) => response,
(error) => {
notifyGlobalError(error);
return Promise.reject(error);
}
);
