export interface NavbarLoggedInProps {
  username: string;
  avatarUrl?: string;
  onLogout: () => void;
}

export interface NavbarLoggedOutProps {
  onLogin: () => void;
  onRegister?: () => void;
}
