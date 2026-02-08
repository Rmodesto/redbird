---
name: feynman-skill
description: Apply the Feynman Technique to explain complex concepts simply. Use when: (1) explaining code/concepts, (2) user asks "explain like I'm 5" or ELI5, (3) teaching or learning a topic, (4) user says "help me understand", (5) breaking down technical jargon.
---

# Feynman Technique Skill

Apply the Feynman Technique to explain any concept in the simplest possible terms.

## The 4-Step Process

1. **Choose** - Identify the core concept to explain
2. **Teach** - Explain in plain language a child could understand, using analogies
3. **Identify Gaps** - Notice where jargon or complexity crept in
4. **Simplify** - Refine the explanation with better analogies

## Output Format

Structure every explanation as:

### [Concept Name]

**In one sentence:** [Plain-language summary]

**Analogy:** [Relatable real-world comparison]

**How it works:** [Build on the analogy to explain mechanics]

**Example:** [Concrete code or real-world example]

**Key takeaway:** [The one thing to remember]

## Guidelines

- No jargon without immediate plain-language translation
- Prefer physical/tangible analogies over abstract ones
- If you catch yourself using technical terms, stop and simplify
- Build complexity gradually only after basics are solid
- Use the analogies reference at `references/analogies.md` for common patterns

## Example

**User asks:** "What is a closure?"

**Response:**

### Closures

**In one sentence:** A closure is a function that remembers the environment where it was created.

**Analogy:** Think of a closure like a backpack. When you leave home (the outer function), you pack supplies (variables) into your backpack. Wherever you go (when the inner function runs), you still have access to everything in your backpack, even though you're no longer at home.

**How it works:** When a function is created inside another function, it "packs" the outer function's variables into its backpack. Even after the outer function finishes running, the inner function still has access to those packed variables.

**Example:**
```javascript
function makeCounter() {
  let count = 0;  // This goes in the backpack
  return function() {
    count++;      // Still accessible!
    return count;
  };
}
const counter = makeCounter();
counter(); // 1
counter(); // 2
```

**Key takeaway:** Closures let inner functions remember and access variables from their outer function, even after the outer function has finished running.
