export function autoPauseVideo(
  node: HTMLVideoElement,
  opts?: { threshold?: number },
): { destroy: () => void } {
  const threshold = typeof opts?.threshold === 'number' ? opts!.threshold! : 0.2;

  // SSR / older browsers
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return { destroy: () => {} };
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) {
          try {
            node.pause();
          } catch {
            // ignore
          }
        }
      }
    },
    { threshold },
  );

  io.observe(node);

  function onVis() {
    if (document.hidden) {
      try {
        node.pause();
      } catch {
        // ignore
      }
    }
  }

  document.addEventListener('visibilitychange', onVis);

  return {
    destroy: () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    },
  };
}

