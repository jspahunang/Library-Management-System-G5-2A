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
import type { User } from '../models';

/**
 * User CRUD and lookup backed by Firestore `users` collection.
 * Reads are served from a live real-time signal; writes go directly to Firestore.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  private _users = signal<User[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const ref = collection(this.firestore, 'users') as CollectionReference<User>;
      onSnapshot(ref, (snapshot) => {
        this._users.set(snapshot.docs.map((d) => d.data() as User));
      });
    }
  }

  getAll(): User[] {
    return this._users();
  }

  getById(userid: string): User | undefined {
    return this._users().find((u) => u.userid === userid);
  }

  getByRole(role: User['role']): User[] {
    return this._users().filter((u) => u.role === role);
  }

  async add(user: User): Promise<void> {
    const ref = doc(this.firestore, 'users', user.userid);
    await setDoc(ref, user);
  }

  async update(userid: string, updates: Partial<User>): Promise<void> {
    const ref = doc(this.firestore, 'users', userid);
    await updateDoc(ref, updates as Record<string, unknown>);
  }

  async delete(userid: string): Promise<void> {
    const ref = doc(this.firestore, 'users', userid);
    await deleteDoc(ref);
  }
}
