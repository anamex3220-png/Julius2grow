import { useCallback, useEffect, useRef, useState } from 'react';

// Señales de integridad para retos de respuesta libre (scenario/open), donde
// "responder con IA" es el riesgo real. No pretende ser prueba de nada —
// son señales que se le muestran al reclutador junto al puntaje para que
// él decida cuánto pesan. En modo "strict" además bloquea pegar texto y
// pide pantalla completa; en modo "signals" solo cuenta, no bloquea.
export function useIntegrity(strict) {
  const stateRef = useRef({
    pasteCount: 0,
    tabSwitchCount: 0,
    awaySeconds: 0,
    fullscreenExits: 0,
    keystrokeCount: 0,
  });
  const hiddenSinceRef = useRef(null);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        hiddenSinceRef.current = Date.now();
        stateRef.current.tabSwitchCount += 1;
      } else if (hiddenSinceRef.current) {
        stateRef.current.awaySeconds += Math.round((Date.now() - hiddenSinceRef.current) / 1000);
        hiddenSinceRef.current = null;
      }
    }
    function onFullscreenChange() {
      const active = !!document.fullscreenElement;
      setFullscreenActive(active);
      if (!active) stateRef.current.fullscreenExits += 1;
    }
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  }, []);

  // Ref callback: se pasa directo como `ref` de cada textarea de respuesta.
  // Funciona igual con una sola (ScenarioChallenge) o con una lista dinámica
  // (una por pregunta en OpenChallenge).
  const attachTextarea = useCallback(
    (el) => {
      if (!el || el.dataset.integrityAttached) return;
      el.dataset.integrityAttached = 'true';
      el.addEventListener('paste', (e) => {
        stateRef.current.pasteCount += 1;
        if (strict) e.preventDefault();
      });
      el.addEventListener('keydown', (e) => {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
          stateRef.current.keystrokeCount += 1;
        }
      });
    },
    [strict]
  );

  const getSignals = useCallback((totalChars) => {
    const s = stateRef.current;
    const suspiciousInputRatio = totalChars > 40 && totalChars > s.keystrokeCount * 1.8;
    return { ...s, suspiciousInputRatio };
  }, []);

  return { attachTextarea, requestFullscreen, fullscreenActive, getSignals, strict };
}
