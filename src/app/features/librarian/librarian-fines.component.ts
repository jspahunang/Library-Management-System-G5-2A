import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FineService } from '../../core/services/fine.service';
import { RoleService } from '../../core/services/role.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import Swal from 'sweetalert2';

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

  async markPaid(fineid: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Settle Fine?',
      text: "Mark this fine as paid?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, settle it'
    });

    if (result.isConfirmed) {
      try {
        await this.fineService.markAsPaid(fineid);
        this.message.set('Fine marked as paid.');
        Swal.fire({ title: 'Settled!', text: 'Fine has been marked as paid.', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (error: any) {
        console.error(error);
        Swal.fire({ title: 'Error', text: 'Failed to update fine: ' + error.message, icon: 'error' });
      }
    }
  }
}
