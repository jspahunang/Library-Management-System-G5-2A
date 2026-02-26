import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { getLocalStorage } from '../utils/local-storage.util';
import type { Fine } from '../models';

/**
 * Fines CRUD and payment status.
 * This service is designed to be migrated to Firebase later (Firestore fines collection).
 */
@Injectable({ providedIn: 'root' })
export class FineService {
  private get storage() {
    return getLocalStorage();
  }

  getAll(): Fine[] {
    const raw = this.storage?.getItem(STORAGE_KEYS.FINES);
    return raw ? (JSON.parse(raw) as Fine[]) : [];
  }

  getById(fineid: string): Fine | undefined {
    return this.getAll().find((f) => f.fineid === fineid);
  }

  getByStudent(studentid: string): Fine[] {
    return this.getAll().filter((f) => f.studentid === studentid);
  }

  getUnpaidByStudent(studentid: string): Fine[] {
    return this.getByStudent(studentid).filter((f) => f.paymentstatus === 'Unpaid');
  }

  getTotalUnpaidAmount(studentid?: string): number {
    const list = studentid ? this.getByStudent(studentid) : this.getAll();
    return list.filter((f) => f.paymentstatus === 'Unpaid').reduce((sum, f) => sum + f.fineamount, 0);
  }

  add(fine: Fine): void {
    const list = this.getAll();
    if (list.some((f) => f.fineid === fine.fineid)) return;
    list.push(fine);
    this.storage?.setItem(STORAGE_KEYS.FINES, JSON.stringify(list));
  }

  markAsPaid(fineid: string): void {
    const list = this.getAll();
    const i = list.findIndex((f) => f.fineid === fineid);
    if (i === -1) return;
    list[i] = { ...list[i], paymentstatus: 'Paid', paymentdate: new Date().toISOString().slice(0, 10) };
    this.storage?.setItem(STORAGE_KEYS.FINES, JSON.stringify(list));
  }

  setAll(fines: Fine[]): void {
    this.storage?.setItem(STORAGE_KEYS.FINES, JSON.stringify(fines));
  }
}
