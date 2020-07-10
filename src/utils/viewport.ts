type ElementViewportVisibility = {
  top: boolean;
  left: boolean;
  right: boolean;
  bottom: boolean;
  any: boolean;
  all: boolean;
};

export function isOutOfViewport(elem: HTMLElement): ElementViewportVisibility {
  // Get element's bounding
  let bounding = elem.getBoundingClientRect();

  // Check if it's out of the viewport on each side
  let top = bounding.top < 0;
  let left = bounding.left < 0;
  let bottom =
    bounding.bottom >
    (window.innerHeight || document.documentElement.clientHeight);
  let right =
    bounding.right >
    (window.innerWidth || document.documentElement.clientWidth);
  let any = top || left || bottom || right;
  let all = top && left && bottom && right;

  return {
    top,
    left,
    right,
    bottom,
    any,
    all,
  };
}
