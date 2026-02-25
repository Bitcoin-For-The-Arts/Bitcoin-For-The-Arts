import { fetchProfileFor } from '$lib/stores/profiles';
import { clearHoverProfile, setHoverProfile } from '$lib/stores/profile-hover';

export function profileHover(node: HTMLElement, pubkey: string) {
  let pk = pubkey;

  function show(e: MouseEvent) {
    if (!pk) return;
    void fetchProfileFor(pk);
    setHoverProfile({ pubkey: pk, x: e.clientX, y: e.clientY });
  }

  function hide() {
    clearHoverProfile(pk);
  }

  node.addEventListener('mouseenter', show);
  node.addEventListener('mousemove', show);
  node.addEventListener('mouseleave', hide);

  return {
    update(next: string) {
      pk = next;
    },
    destroy() {
      node.removeEventListener('mouseenter', show);
      node.removeEventListener('mousemove', show);
      node.removeEventListener('mouseleave', hide);
      hide();
    },
  };
}

