import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable status chip/badge for Borrow, Fine, and other statuses.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="badgeClass()">
      {{ label() ?? status() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  /** Display text (defaults to status value). */
  label = input<string | null>(null);
  /** Status value used for styling when label not provided. */
  status = input<string>('');
  /** Type of status: 'borrow' | 'payment' | 'generic' */
  type = input<'borrow' | 'payment' | 'generic'>('generic');

  badgeClass(): string {
    const s = (this.label() ?? this.status()).toLowerCase();
    const t = this.type();
    if (t === 'borrow') {
      if (s === 'borrowed') return 'badge badge-sky';
      if (s === 'overdue') return 'badge badge-amber';
      if (s === 'returned') return 'badge badge-emerald';
    }
    if (t === 'payment') {
      if (s === 'paid') return 'badge badge-emerald';
      if (s === 'unpaid') return 'badge badge-rose';
    }
    return 'badge badge-slate';
  }
}
