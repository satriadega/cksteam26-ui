export interface Profile {
  username: string;
  name: string;
  email: string;
  statusNotification: boolean;
  hasNotification: boolean;
  notificationCounter: number;
  notificationType: number;
}

export interface ProfileResponse {
  data: Profile[];
  success: boolean;
  message: string;
  timestamp: string;
}
