/**
 * The one clock (docs/revamp/06, "one clock"). Every per-frame task on the
 * page — scroll-linked transforms, the cursor, WebGL stages — runs from this
 * single requestAnimationFrame loop, in registration order, so nothing
 * drifts against anything else.
 *
 * The loop sleeps when no task needs a frame and wakes on demand, so an idle
 * page costs nothing. A task returns `true` to ask for another frame.
 */

export type FrameTask = (time: number, dt: number) => boolean | void;

const tasks = new Set<FrameTask>();
let raf = 0;
let last = 0;
let running = false;

function frame(now: number) {
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
  last = now;
  let more = false;
  for (const task of tasks) {
    if (task(now, dt)) more = true;
  }
  if (more && !document.hidden) {
    raf = requestAnimationFrame(frame);
  } else {
    running = false;
    last = 0;
  }
}

/** Make sure the loop runs on the next frame. Cheap to call often. */
export function wake() {
  if (running || typeof window === "undefined") return;
  running = true;
  raf = requestAnimationFrame(frame);
}

/** Add a task; returns a function that removes it. */
export function onFrame(task: FrameTask): () => void {
  tasks.add(task);
  wake();
  return () => {
    tasks.delete(task);
    if (!tasks.size && running) {
      cancelAnimationFrame(raf);
      running = false;
      last = 0;
    }
  };
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wake();
  });
}
