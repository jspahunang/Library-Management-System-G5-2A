/**
 * Notification entity - maps to tblNotification in ERD.
 * Many-to-one with Student (studentid -> student).
 */
export interface Notification {
  notificationid: string;
  studentid: string;
  messageTitle: string; // massagetitle in ERD
  message: string;
  timestamp: string; // ISO datetime
  read: boolean; // for read/unread status in UI
}
