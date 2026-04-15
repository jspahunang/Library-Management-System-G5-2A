import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Firestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
} from '@angular/fire/firestore';
import type { Book } from '../models';

/**
 * Book CRUD and catalog backed by Firestore `books` collection.
 */
@Injectable({ providedIn: 'root' })
export class BookService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  private _books = signal<Book[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const ref = collection(this.firestore, 'books') as CollectionReference<Book>;
      onSnapshot(ref, (snapshot) => {
        this._books.set(snapshot.docs.map((d) => d.data() as Book));
      });
    }
  }

  getAll(): Book[] {
    return this._books();
  }

  getById(bookid: string): Book | undefined {
    return this._books().find((b) => b.bookid === bookid);
  }

  getByCategory(category: string): Book[] {
    return this._books().filter((b) => b.category === category);
  }

  search(query: string): Book[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.getAll();
    return this._books().filter(
      (b) =>
        (b.booktitle ?? '').toLowerCase().includes(q) ||
        (b.author ?? '').toLowerCase().includes(q) ||
        (b.isbn ?? '').toLowerCase().includes(q) ||
        (b.category ?? '').toLowerCase().includes(q)
    );
  }

  async add(book: Book): Promise<void> {
    const ref = doc(this.firestore, 'books', book.bookid);
    await setDoc(ref, book);
  }

  async update(bookid: string, updates: Partial<Book>): Promise<void> {
    const ref = doc(this.firestore, 'books', bookid);
    await updateDoc(ref, updates as Record<string, unknown>);
  }

  async delete(bookid: string): Promise<void> {
    const ref = doc(this.firestore, 'books', bookid);
    await deleteDoc(ref);
  }

  async decreaseAvailableCopies(bookid: string, by = 1): Promise<void> {
    const book = this.getById(bookid);
    if (!book || book.availableCopies < by) return;
    await this.update(bookid, {
      availableCopies: book.availableCopies - by,
      status: book.availableCopies - by === 0 ? 'Borrowed Out' : book.status,
    });
  }

  async increaseAvailableCopies(bookid: string, by = 1): Promise<void> {
    const book = this.getById(bookid);
    if (!book) return;
    await this.update(bookid, {
      availableCopies: Math.min(book.availableCopies + by, book.totalCopies),
      status: 'Available',
    });
  }
}
