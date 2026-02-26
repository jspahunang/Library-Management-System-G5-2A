import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import type { Book } from '../models';

/**
 * Book CRUD and catalog.
 * This service is designed to be migrated to Firebase later (Firestore books collection).
 */
@Injectable({ providedIn: 'root' })
export class BookService {
  private get storage() {
    return getLocalStorage();
  }

  getAll(): Book[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.BOOKS);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  }

  getById(bookid: string): Book | undefined {
    return this.getAll().find((b) => b.bookid === bookid);
  }

  getByCategory(category: string): Book[] {
    return this.getAll().filter((b) => b.category === category);
  }

  search(query: string): Book[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter(
      (b) =>
        (b.booktitle ?? '').toLowerCase().includes(q) ||
        (b.author ?? '').toLowerCase().includes(q) ||
        (b.isbn ?? '').toLowerCase().includes(q) ||
        (b.category ?? '').toLowerCase().includes(q)
    );
  }

  add(book: Book): void {
    const list = this.getAll();
    if (list.some((b) => b.bookid === book.bookid)) return;
    list.push(book);
    this.storage?.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(list));
  }

  update(bookid: string, updates: Partial<Book>): void {
    const list = this.getAll();
    const i = list.findIndex((b) => b.bookid === bookid);
    if (i === -1) return;
    list[i] = { ...list[i], ...updates };
    this.storage?.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(list));
  }

  delete(bookid: string): void {
    const list = this.getAll().filter((b) => b.bookid !== bookid);
    this.storage?.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(list));
  }

  decreaseAvailableCopies(bookid: string, by = 1): void {
    const book = this.getById(bookid);
    if (!book || book.availableCopies < by) return;
    this.update(bookid, {
      availableCopies: book.availableCopies - by,
      status: book.availableCopies - by === 0 ? 'Borrowed Out' : book.status,
    });
  }

  increaseAvailableCopies(bookid: string, by = 1): void {
    const book = this.getById(bookid);
    if (!book) return;
    this.update(bookid, {
      availableCopies: Math.min(book.availableCopies + by, book.totalCopies),
      status: 'Available',
    });
  }

  setAll(books: Book[]): void {
    this.storage?.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }
}
