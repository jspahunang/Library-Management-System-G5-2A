import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { LoginService } from '../../core/services/login.service';
import { RoleService } from '../../core/services/role.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { User, UserRole } from '../../core/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor() {}

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

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const id = this.editingId();
    if (id) {
      this.userService.update(id, { ...v });
    } else {
      const userid = `u-${Date.now()}`;
      this.userService.add({
        userid,
        Fname: v.Fname,
        Minitial: v.Minitial ?? '',
        Lname: v.Lname,
        email: v.email,
        phone: v.phone ?? '',
        status: v.status,
        role: v.role,
      });
      this.loginService.setAll([
        ...this.loginService.getAll(),
        { userid, email: v.email, password: 'password123' },
      ]);
    }
    this.cancelForm();
  }

  delete(userid: string): void {
    if (confirm('Remove this user? This will not remove login or role records.')) this.userService.delete(userid);
  }
}

