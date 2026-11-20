#!/usr/bin/env node
// Makes one admin-panel account entry. Run:  node scripts/admin-password.mjs
// It asks for a login name and a password (typed hidden) and prints a line to
// put in ADMIN_USERS. Several people: join their lines with a semicolon.
// The password is not stored anywhere; only its scrypt hash is printed.
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

const ask = (question, hidden = false) =>
  new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (text) => rl.output.write(text.includes(question) ? text : "");
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });

const name = String(await ask("Login name (letters and numbers, e.g. archana): ")).trim().toLowerCase();
if (!/^[a-z0-9_-]{2,32}$/.test(name)) {
  console.error("Use 2 to 32 lowercase letters, numbers, - or _.");
  process.exit(1);
}
const password = String(await ask("Password (at least 12 characters, typing is hidden): ", true));
if (password.length < 12) {
  console.error("Too short. Use at least 12 characters.");
  process.exit(1);
}
const again = String(await ask("Type it again: ", true));
if (again !== password) {
  console.error("The two passwords did not match.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log("\nAdd this to ADMIN_USERS (join several people with a semicolon):\n");
console.log(`${name}:${salt.toString("hex")}:${hash.toString("hex")}`);
