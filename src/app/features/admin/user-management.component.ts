import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { LoginService } from '../../core/services/login.service';
import { RoleService } from '../../core/services/role.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { User, UserRole } from '../../core/models';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule, DialogModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private loginService = inject(LoginService);
  private roleService = inject(RoleService);

  users = computed(() => this.userService.getAll());
  searchQuery = signal('');
  roleFilter = signal<UserRole | ''>('');
  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();
    let list = this.users();
    if (role) list = list.filter((u) => u.role === role);
    if (q) list = list.filter((u) => u.Fname.toLowerCase().includes(q) || u.Lname.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    return list;
  });

  showForm = signal(false);
  editingId = signal<string | null>(null);
  form = this.fb.nonNullable.group({
    Fname: ['', Validators.required],
    Minitial: [''],
    Lname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    status: ['Active' as User['status'], Validators.required],
    role: ['Student' as UserRole, Validators.required],
  });

  statusOptions = [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }];
  roleOptions = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Librarian', value: 'Librarian' },
    { label: 'Student', value: 'Student' },
    { label: 'Teacher', value: 'Teacher' }
  ];

  constructor() { }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset({ Fname: '', Minitial: '', Lname: '', email: '', phone: '', status: 'Active', role: 'Student' });
    this.showForm.set(true);
  }

  openEdit(user: User): void {
    this.editingId.set(user.userid);
    this.form.patchValue({
      Fname: user.Fname,
      Minitial: user.Minitial,
      Lname: user.Lname,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role,
    });
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const id = this.editingId();
    
    try {
      if (id) {
        await this.userService.update(id, { ...v });
        // NOTE: Role migration editing is skipped for simplicity. Recreate users to change roles.
        Swal.fire({ title: 'Updated!', text: 'User details have been successfully updated.', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        // Duplicate name check: same Fname + Minitial + Lname (case-insensitive)
        const duplicate = this.users().find((u) =>
          u.Fname.trim().toLowerCase() === v.Fname.trim().toLowerCase() &&
          (u.Minitial ?? '').trim().toLowerCase() === (v.Minitial ?? '').trim().toLowerCase() &&
          u.Lname.trim().toLowerCase() === v.Lname.trim().toLowerCase()
        );
        if (duplicate) {
          Swal.fire({
            title: 'User Already Exists',
            text: `A user named "${v.Fname} ${v.Minitial ? v.Minitial + '. ' : ''}${v.Lname}" already exists in the system.`,
            icon: 'warning',
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'OK'
          });
          return;
        }

        const userid = `u-${Date.now()}`;
        await this.userService.add({
          userid,
          Fname: v.Fname,
          Minitial: v.Minitial ?? '',
          Lname: v.Lname,
          email: v.email,
          phone: v.phone ?? '',
          status: v.status,
          role: v.role,
        });

        // Push foreign keys into role tables so system actions function normally
        if (v.role === 'Student') await this.roleService.addStudent({ studentid: userid, userid, yearLevel: 1 });
        else if (v.role === 'Teacher') await this.roleService.addTeacher({ teacherid: userid, userid, department: 'General' });
        else if (v.role === 'Librarian') await this.roleService.addLibrarian({ librarianid: userid, userid });
        else if (v.role === 'Admin') await this.roleService.addAdmin({ adminid: userid, userid });

        Swal.fire({ title: 'Added!', text: 'New user has been successfully created.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
      this.cancelForm();
    } catch (error: any) {
      console.error(error);
      Swal.fire({ title: 'Error', text: 'Operation failed: ' + error.message, icon: 'error' });
    }
  }

  delete(userid: string): void {
    Swal.fire({
      title: 'Remove this user?',
      text: "This will not remove login or role records.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.userService.delete(userid);
        Swal.fire({
          title: 'Deleted!',
          text: 'The user has been removed.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }
}

