import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Firestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  CollectionReference,
} from '@angular/fire/firestore';
import { BookService } from './book.service';
import { FineService } from './fine.service';
import { NotificationService } from './notification.service';
import type { BorrowRecord } from '../models';

const BORROW_DAYS = 14;
const FINE_PER_DAY = 10;

/**
 * Borrow and return transactions backed by Firestore `borrow_records` collection.
 */
@Injectable({ providedIn: 'root' })
export class BorrowService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  
  private bookService = inject(BookService);
  private fineService = inject(FineService);
  private notificationService = inject(NotificationService);

  private _records = signal<BorrowRecord[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const ref = collection(this.firestore, 'borrow_records') as CollectionReference<BorrowRecord>;
      onSnapshot(ref, (snapshot) => {
        this._records.set(snapshot.docs.map((d) => d.data() as BorrowRecord));
        // We could run overdue check here, but it's better done occasionally or by a cloud function.
        this.updateStatusesAsync();
      });
    }
  }

  getAll(): BorrowRecord[] {
    return this._records();
  }

  getById(borrowid: string): BorrowRecord | undefined {
    return this._records().find((b) => b.borrowid === borrowid);
  }

  getByStudent(studentid: string): BorrowRecord[] {
    return this._records().filter((b) => b.studentid === studentid);
  }

  getByBook(bookid: string): BorrowRecord[] {
    return this._records().filter((b) => b.bookid === bookid);
  }

  getActiveByStudent(studentid: string): BorrowRecord[] {
    return this.getByStudent(studentid).filter((b) => b.status === 'Borrowed' || b.status === 'Overdue');
  }

  getOverdue(): BorrowRecord[] {
    const today = new Date().toISOString().slice(0, 10);
    return this._records().filter((b) => (b.status === 'Borrowed' || b.status === 'Overdue') && b.duedate < today);
  }

  getBorrowedCount(): number {
    return this._records().filter((b) => b.status === 'Borrowed' || b.status === 'Overdue').length;
  }

  private async updateStatusesAsync(): Promise<void> {
    const list = this.getAll();
    const today = new Date().toISOString().slice(0, 10);
    for (const rec of list) {
      if (rec.status === 'Borrowed' && rec.returndate === null && rec.duedate < today) {
        await updateDoc(doc(this.firestore, 'borrow_records', rec.borrowid), { status: 'Overdue' });
      }
    }
  }

  async borrow(bookid: string, studentid: string): Promise<{ success: boolean; message: string }> {
    const book = this.bookService.getById(bookid);
    if (!book) return { success: false, message: 'Book not found.' };
    if (book.availableCopies < 1) return { success: false, message: 'No copies available.' };
    
    const borrowdate = new Date().toISOString().slice(0, 10);
    const duedate = new Date(Date.now() + BORROW_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const id = `br-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    const record: BorrowRecord = {
      borrowid: id,
      bookid,
      studentid,
      booktitle: book.booktitle,
      borrowdate,
      duedate,
      returndate: null,
      status: 'Borrowed',
    };
    
    await setDoc(doc(this.firestore, 'borrow_records', id), record);
    await this.bookService.decreaseAvailableCopies(bookid, 1);
    
    await this.notificationService.add({
      studentid,
      messageTitle: 'Book borrowed',
      message: `You borrowed "${book.booktitle}". Due date: ${duedate}.`,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true, message: 'Book borrowed successfully.' };
  }

  async return(borrowid: string): Promise<{ success: boolean; message: string }> {
    const rec = this.getById(borrowid);
    if (!rec) return { success: false, message: 'Borrow record not found.' };
    if (rec.status === 'Returned') return { success: false, message: 'Already returned.' };
    
    const returndate = new Date().toISOString().slice(0, 10);
    const today = new Date(returndate);
    const due = new Date(rec.duedate);
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (24 * 60 * 60 * 1000)));
    
    await updateDoc(doc(this.firestore, 'borrow_records', borrowid), { returndate, status: 'Returned' });
    await this.bookService.increaseAvailableCopies(rec.bookid, 1);
    
    if (daysOverdue > 0) {
      await this.fineService.add({
        fineid: `fine-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        studentid: rec.studentid,
        borrowid: rec.borrowid,
        fineamount: daysOverdue * FINE_PER_DAY,
        paymentstatus: 'Unpaid',
        daysOverdue,
        paymentdate: null,
      });
      await this.notificationService.add({
        studentid: rec.studentid,
        messageTitle: 'Overdue fine issued',
        message: `Returned "${rec.booktitle}" ${daysOverdue} day(s) overdue. A fine of ₱${daysOverdue * FINE_PER_DAY} has been issued.`,
        timestamp: new Date().toISOString(),
      });
    } else {
      await this.notificationService.add({
        studentid: rec.studentid,
        messageTitle: 'Book returned',
        message: `You returned "${rec.booktitle}". Thank you!`,
        timestamp: new Date().toISOString(),
      });
    }
    
    return { success: true, message: 'Book returned successfully.' };
  }
}
