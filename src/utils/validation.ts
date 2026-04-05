export const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string) => {
  // Accepts: +947XXXXXXXX, 07XXXXXXXX, +9411XXXXXXX, 011XXXXXXX
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  const regex = /^(\+94|0)?([1-9]\d{8})$/;
  return regex.test(cleaned);
};

export const validatePassword = (password: string) => {
  return password.length >= 6;
};

export const isNotEmpty = (value: string) => {
  return value.trim().length > 0;
};
