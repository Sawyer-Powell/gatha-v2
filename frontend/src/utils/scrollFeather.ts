export interface ScrollFeather {
  top: number;
  bottom: number;
}

export function scrollFeatherFor(el: HTMLElement | undefined): ScrollFeather {
  if (!el) return { top: 0, bottom: 0 };
  const overflow = Math.max(0, el.scrollHeight - el.clientHeight);
  if (overflow < 1) return { top: 0, bottom: 0 };
  const remaining = Math.max(0, overflow - el.scrollTop);
  return {
    top: Math.min(14, el.scrollTop),
    bottom: Math.min(14, remaining),
  };
}

export function scrollFeatherStyle(feather: ScrollFeather) {
  return `--scroll-feather-top: ${feather.top}px; --scroll-feather-bottom: ${feather.bottom}px;`;
}
