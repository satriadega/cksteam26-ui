export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  const authStatus = !!token;
  console.log("isAuthenticated (from utils/auth.ts):", authStatus);
  return authStatus;
};

export const clearAuth = (): void => {
  localStorage.removeItem("token");
};
