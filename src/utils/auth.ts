export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const clearAuth = (): void => {
  localStorage.removeItem("token");
};
