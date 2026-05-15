/**
 * Notification entity - maps to tblNotification in ERD.
 * Can belong to a Student (studentid) or a Teacher (teacherid).
 */
export interface Notification {
  notificationid: string;
  studentid?: string;
  teacherid?: string;
  messageTitle: string; // messageTitle in ERD
  message: string;
  timestamp: string; // ISO datetime
  read: boolean; // for read/unread status in UI
}
