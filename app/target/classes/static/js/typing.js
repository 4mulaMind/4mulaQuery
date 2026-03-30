/**
 * =========================================================
 *    TYPING ANIMATION MODULE (typing.js)
 *    ------------------------------------------------------
 *    Creates dynamic typing animation for the homepage
 *    header text. Displays multiple phrases sequentially
 *    with typing and deleting effects.
 *
 *    Features:
 *    - Smooth typing animation
 *    - Auto phrase switching
 *    - Typing and deleting effect
 *    - Infinite loop display
 * =========================================================
 *
 * @format
 */

/* ---------------------------------------------------------
   Phrase List
   ---------------------------------------------------------
   Text phrases displayed in the typing animation
--------------------------------------------------------- */
const phrases = [
  "Fastest C++ B-Tree Engine",
  "Spring Boot + Docker Integrated",
  "Intelligent Query Processing",
  "AI Powered SQL Optimization",
  "Real-Time Query Performance Insights",
  "Machine Learning Driven Database Engine",
  "Next Generation Query Analyzer",
  "Smart Database Exploration",
  "Predictive SQL Execution Engine",
  "Developed by Abdul Qadir",
];

/* ---------------------------------------------------------
   Typing State Variables
   ---------------------------------------------------------
   pIndex      → current phrase index
   cIndex      → current character index
   deleting    → whether text is deleting
   typingTimer → timer for typing loop
--------------------------------------------------------- */
let pIndex = 0,
  cIndex = 0,
  deleting = false,
  typingTimer = null;

/* ---------------------------------------------------------
   Typing Animation Starter
   ---------------------------------------------------------
   Resets state and begins animation loop
--------------------------------------------------------- */
function startTyping() {
  if (typingTimer) clearTimeout(typingTimer);

  pIndex = 0;
  cIndex = 0;
  deleting = false;

  typeNext();
}

/* ---------------------------------------------------------
   Typing Engine
   ---------------------------------------------------------
   Handles typing, deleting, and phrase switching
--------------------------------------------------------- */
function typeNext() {
  const el = document.getElementById("dynamic-text");

  if (!el) return;

  const text = phrases[pIndex];

  el.textContent = deleting
    ? text.substring(0, cIndex--)
    : text.substring(0, cIndex++);

  if (!deleting && cIndex > text.length) {
    deleting = true;

    typingTimer = setTimeout(typeNext, 2000);
  } else if (deleting && cIndex === 0) {
    deleting = false;

    pIndex = (pIndex + 1) % phrases.length;

    typingTimer = setTimeout(typeNext, 500);
  } else {
    typingTimer = setTimeout(typeNext, deleting ? 50 : 100);
  }
}
