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
import type { Fine } from '../models';

/**
 * Fines CRUD and payment status backed by Firestore `fines` collection.
 */
@Injectable({ providedIn: 'root' })
export class FineService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  private _fines = signal<Fine[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const ref = collection(this.firestore, 'fines') as CollectionReference<Fine>;
      onSnapshot(ref, (snapshot) => {
        this._fines.set(snapshot.docs.map((d) => d.data() as Fine));
      });
    }
  }

  getAll(): Fine[] {
    return this._fines();
  }

  getById(fineid: string): Fine | undefined {
    return this._fines().find((f) => f.fineid === fineid);
  }

  getByStudent(studentid: string): Fine[] {
    return this._fines().filter((f) => f.studentid === studentid);
  }

  getUnpaidByStudent(studentid: string): Fine[] {
    return this.getByStudent(studentid).filter((f) => f.paymentstatus === 'Unpaid');
  }

  getTotalUnpaidAmount(studentid?: string): number {
    const list = studentid ? this.getByStudent(studentid) : this.getAll();
    return list.filter((f) => f.paymentstatus === 'Unpaid').reduce((sum, f) => sum + f.fineamount, 0);
  }

  async add(fine: Fine): Promise<void> {
    const ref = doc(this.firestore, 'fines', fine.fineid);
    await setDoc(ref, fine);
  }

  async markAsPaid(fineid: string): Promise<void> {
    const ref = doc(this.firestore, 'fines', fineid);
    await updateDoc(ref, {
      paymentstatus: 'Paid',
      paymentdate: new Date().toISOString().slice(0, 10),
    });
  }
}
