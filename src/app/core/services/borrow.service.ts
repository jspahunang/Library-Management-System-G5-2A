import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import { BookService } from './book.service';
import { FineService } from './fine.service';
import { NotificationService } from './notification.service';
import type { BorrowRecord, BorrowStatus } from '../models';

const BORROW_DAYS = 14;
const FINE_PER_DAY = 10;

/**
 * Borrow and return transactions; overdue detection and fine creation.
 * This service is designed to be migrated to Firebase later (Firestore borrow_records + Cloud Functions for fines).
 */
@Injectable({ providedIn: 'root' })
export class BorrowService {
  private get storage() {
    return getLocalStorage();
  }

  constructor(
    private bookService: BookService,
    private fineService: FineService,
    private notificationService: NotificationService
  ) {}

  getAll(): BorrowRecord[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.BORROW_RECORDS);
    return raw ? (JSON.parse(raw) as BorrowRecord[]) : [];
  }

  getById(borrowid: string): BorrowRecord | undefined {
    return this.getAll().find((b) => b.borrowid === borrowid);
  }

  getByStudent(studentid: string): BorrowRecord[] {
    return this.getAll().filter((b) => b.studentid === studentid);
  }

  getByBook(bookid: string): BorrowRecord[] {
    return this.getAll().filter((b) => b.bookid === bookid);
  }

  getActiveByStudent(studentid: string): BorrowRecord[] {
    return this.getByStudent(studentid).filter((b) => b.status === 'Borrowed' || b.status === 'Overdue');
  }

  getOverdue(): BorrowRecord[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.getAll().filter((b) => (b.status === 'Borrowed' || b.status === 'Overdue') && b.duedate < today);
  }

  getBorrowedCount(): number {
    return this.getAll().filter((b) => b.status === 'Borrowed' || b.status === 'Overdue').length;
  }

  private updateStatuses(): void {
    const list = this.getAll();
    const today = new Date().toISOString().slice(0, 10);
    let changed = false;
    for (let i = 0; i < list.length; i++) {
      if (list[i].status === 'Borrowed' && list[i].returndate === null && list[i].duedate < today) {
        list[i].status = 'Overdue';
        changed = true;
      }
    }
    if (changed) this.storage?.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(list));
  }

  borrow(bookid: string, studentid: string): { success: boolean; message: string } {
    this.updateStatuses();
    const book = this.bookService.getById(bookid);
    if (!book) return { success: false, message: 'Book not found.' };
    if (book.availableCopies < 1) return { success: false, message: 'No copies available.' };
    const borrowdate = new Date().toISOString().slice(0, 10);
    const duedate = new Date(Date.now() + BORROW_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const record: BorrowRecord = {
      borrowid: `br-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      bookid,
      studentid,
      booktitle: book.booktitle,
      borrowdate,
      duedate,
      returndate: null,
      status: 'Borrowed',
    };
    const list = this.getAll();
    list.push(record);
    this.storage?.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(list));
    this.bookService.decreaseAvailableCopies(bookid, 1);
    this.notificationService.add({
      studentid,
      messageTitle: 'Book borrowed',
      message: `You borrowed "${book.booktitle}". Due date: ${duedate}.`,
      timestamp: new Date().toISOString(),
    });
    return { success: true, message: 'Book borrowed successfully.' };
  }

  return(borrowid: string): { success: boolean; message: string } {
    this.updateStatuses();
    const list = this.getAll();
    const i = list.findIndex((b) => b.borrowid === borrowid);
    if (i === -1) return { success: false, message: 'Borrow record not found.' };
    const rec = list[i];
    if (rec.status === 'Returned') return { success: false, message: 'Already returned.' };
    const returndate = new Date().toISOString().slice(0, 10);
    const today = new Date(returndate);
    const due = new Date(rec.duedate);
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (24 * 60 * 60 * 1000)));
    list[i] = { ...rec, returndate, status: 'Returned' };
    this.storage?.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(list));
    this.bookService.increaseAvailableCopies(rec.bookid, 1);
    if (daysOverdue > 0) {
      this.fineService.add({
        fineid: `fine-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        studentid: rec.studentid,
        borrowid: rec.borrowid,
        fineamount: daysOverdue * FINE_PER_DAY,
        paymentstatus: 'Unpaid',
        daysOverdue,
        paymentdate: null,
      });
      this.notificationService.add({
        studentid: rec.studentid,
        messageTitle: 'Overdue fine issued',
        message: `Returned "${rec.booktitle}" ${daysOverdue} day(s) overdue. A fine of ₱${daysOverdue * FINE_PER_DAY} has been issued.`,
        timestamp: new Date().toISOString(),
      });
    } else {
      this.notificationService.add({
        studentid: rec.studentid,
        messageTitle: 'Book returned',
        message: `You returned "${rec.booktitle}". Thank you!`,
        timestamp: new Date().toISOString(),
      });
    }
    return { success: true, message: 'Book returned successfully.' };
  }

  setAll(records: BorrowRecord[]): void {
    this.storage?.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(records));
  }
}
