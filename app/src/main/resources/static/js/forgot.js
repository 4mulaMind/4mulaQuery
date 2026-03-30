/**
 * =========================================================
 *    PASSWORD RESET MODULE (forgot.js)
 *    ------------------------------------------------------
 *    Handles "Forgot Password" functionality.
 *    Allows users to reset their password using OTP
 *    verification.
 *
 *    Features:
 *    - OTP generation
 *    - OTP verification
 *    - Password reset
 *    - Auto focus for OTP inputs
 * =========================================================
 *
 * @format
 */

/* ---------------------------------------------------------
   Global Reset State
   ---------------------------------------------------------
   generatedOtp → temporary OTP code
   otpEmail     → email associated with OTP request
--------------------------------------------------------- */
let generatedOtp = null,
  otpEmail = null;

/* ---------------------------------------------------------
   OTP Generator
   ---------------------------------------------------------
   Validates email and generates a 4-digit OTP
--------------------------------------------------------- */
function sendOtp() {
  const email = document.getElementById("forgotEmail").value.trim();

  if (!email) return showToast("forgotToast", "Enter your email");

  const users = getUsers();

  if (!users[email])
    return showToast("forgotToast", "No account with this email.");

  otpEmail = email;

  generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  showToast("forgotToast", `Your OTP: ${generatedOtp}`, "success");

  setTimeout(() => {
    document.getElementById("fStep1").style.display = "none";
    document.getElementById("fStep2").style.display = "block";
  }, 1200);
}

/* ---------------------------------------------------------
   OTP Auto Focus
   ---------------------------------------------------------
   Automatically moves cursor to next OTP field
--------------------------------------------------------- */
function otpNext(el, idx) {
  if (el.value && idx < 3)
    document.querySelectorAll(".otp-input")[idx + 1].focus();
}

/* ---------------------------------------------------------
   OTP Verification
   ---------------------------------------------------------
   Checks entered OTP with generated OTP
--------------------------------------------------------- */
function verifyOtp() {
  const entered = [...document.querySelectorAll(".otp-input")]
    .map((i) => i.value)
    .join("");

  if (entered !== generatedOtp)
    return showToast("forgotToast", "Invalid OTP. Try again.");

  document.getElementById("fStep2").style.display = "none";
  document.getElementById("fStep3").style.display = "block";
}

/* ---------------------------------------------------------
   Password Reset Handler
   ---------------------------------------------------------
   Updates user password after OTP verification
--------------------------------------------------------- */
function resetPass() {
  const p1 = document.getElementById("newPass").value;
  const p2 = document.getElementById("newPass2").value;

  if (!p1 || p1 !== p2)
    return showToast("forgotToast", "Passwords do not match");

  if (p1.length < 6) return showToast("forgotToast", "Min 6 characters");

  const users = getUsers();

  users[otpEmail].password = btoa(p1);

  saveUsers(users);

  showToast("forgotToast", "Password updated! Redirecting...", "success");

  setTimeout(() => {
    showPage("loginPage");
  }, 1500);
}
