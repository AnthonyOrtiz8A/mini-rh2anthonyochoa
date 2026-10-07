import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageNotFound() {
  const location = useLocation();

  useEffect(() => {
    console.warn(`[404] Ruta no encontrada: ${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return location;
}