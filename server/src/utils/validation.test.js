import assert from "node:assert/strict";
import { escapeRegex, number, text } from "./validation.js";

assert.equal(escapeRegex("a.*(b)"), "a\\.\\*\\(b\\)");
assert.equal(number("20", "limit", { min: 1, max: 100 }), 20);
assert.throws(() => number("-1", "limit", { min: 1, max: 100 }));
assert.equal(text("  hello  ", "name", { max: 10 }), "hello");
assert.throws(() => text("too long", "name", { max: 3 }));
console.log("validation checks passed");
