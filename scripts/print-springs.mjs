/**
 * Prints the CSS spring easings for app/styles/tokens.css from
 * lib/motion/spring.ts. Run: node --experimental-strip-types scripts/print-springs.mjs
 */
import { SPRINGS, cssLinear } from "../lib/motion/spring.ts";

console.log(`--spring: ${cssLinear(SPRINGS.smooth)};`);
for (const [name, spec] of Object.entries(SPRINGS)) {
  if (spec.bounce === 0) console.log(`--dur-spring-${name}: ${Math.round(spec.duration * 1000)}ms;`);
}
