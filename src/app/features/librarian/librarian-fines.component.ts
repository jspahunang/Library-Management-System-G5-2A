import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FineService } from '../../core/services/fine.service';
import { RoleService } from '../../core/services/role.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-librarian-fines',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, TableModule, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './librarian-fines.component.html',
  styleUrl: './librarian-fines.component.scss',
})
export class LibrarianFinesComponent {
  fines = computed(() => this.fineService.getAll());
  message = signal('');
  searchStudentId = signal('');

  filteredFines = computed(() => {
    const sid = this.searchStudentId().trim();
    const list = this.fines();
    return sid ? list.filter((f) => f.studentid === sid) : list;
  });

  constructor(
    private fineService: FineService,
    private roleService: RoleService
  ) { }

  markPaid(fineid: string): void {
    this.fineService.markAsPaid(fineid);
    this.message.set('Fine marked as paid.');
  }
}
