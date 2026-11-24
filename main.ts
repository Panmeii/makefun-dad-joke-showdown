// Entry program for the make.fun "Dad Joke Showdown" competition
// (u-mfnakmal-dad-joke-showdown-1d2ce3e5).
//
// The whole entry is one dad joke, written for this bounty: a straight
// question-and-answer setup whose punchline is a clean pun that lands
// on the very last word — two minus two is nothing, and a dog, asked
// anything at all, also says nothing. It is built to be told out loud
// across a dinner table, deadpan, with the groan arriving at the end.
//
// The program writes the joke to entry.txt in the output directory
// (MAKEFUN_OUTPUT_DIR, falling back to /output) and then re-reads the
// file it wrote and verifies it against the competition gate: UTF-8
// text of 1 to 200 characters, not only whitespace, a single line.
// Any violation exits non-zero so a bad entry can never ship quietly.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke itself, kept as data so the verification below checks
// exactly the characters the judge will read.
const JOKE = "I asked my dog what's two minus two. He said nothing.";

const MAX_CHARS = 200; // the gate's ceiling for this competition

function verify(text: string): string[] {
  const problems: string[] = [];
  const chars = [...text].length; // count code points, not bytes
  if (chars < 1 || chars > MAX_CHARS) {
    problems.push(`length ${chars} is outside 1..${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("entry must be a single line");
  }
  // The punchline has to be the last thing read: nothing may trail it.
  if (!text.endsWith("nothing.")) {
    problems.push("punchline is not at the end of the line");
  }
  // A round-trip through UTF-8 must give back the identical string,
  // so no character can be mangled between this file and the judge.
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    problems.push("entry does not survive a UTF-8 round-trip");
  }
  // Delivery polish: no stray padding and no doubled spaces, so the
  // line reads exactly as it would be spoken, with no stumbles.
  if (text !== text.trim()) {
    problems.push("entry has leading or trailing whitespace");
  }
  if (text.includes("  ")) {
    problems.push("entry contains a doubled space");
  }
  return problems;
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.txt");
writeFileSync(dest, JOKE, "utf8");

// Verify what is actually on disk, not just what we meant to write.
const written = readFileSync(dest, "utf8");
const problems = verify(written);
if (problems.length > 0) {
  console.error("entry failed verification:", problems.join("; "));
  process.exit(1);
}
console.log(
  `entry.txt delivered to ${dest}: ${[...written].length} characters, gate OK`,
);
