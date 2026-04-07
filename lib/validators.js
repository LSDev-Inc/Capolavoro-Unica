export function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

export function isValidUsername(username) {
  return (
    typeof username === "string" &&
    username.trim().length >= 3 &&
    username.trim().length <= 30
  );
}

export function isValidNote(title, content) {
  return (
    typeof title === "string" &&
    title.trim().length >= 1 &&
    title.trim().length <= 120 &&
    typeof content === "string" &&
    content.trim().length >= 1 &&
    content.trim().length <= 5000
  );
}
