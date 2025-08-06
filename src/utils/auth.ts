export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // Returns true if a token exists, false otherwise
};

export const getUsernameFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return "";
  }
  // In a real application, you would decode the token here
  // and extract the username.  For this example, I'll assume
  // the token contains the username.  This is NOT secure.
  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken.username || "";
  } catch (error) {
    console.error("Error decoding token:", error);
    return "";
  }
};
