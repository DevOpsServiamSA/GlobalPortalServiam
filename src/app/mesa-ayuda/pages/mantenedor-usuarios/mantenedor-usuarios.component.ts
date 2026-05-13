import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import {
  AreaDto,
  CreateUsuarioRequest,
  RolDto,
  UpdateUsuarioRequest,
  UsuarioDetailDto,
  UsuarioListItemDto
} from '../../models';

@Component({
  selector: 'app-mantenedor-usuarios',
  templateUrl: './mantenedor-usuarios.component.html',
  styleUrls: ['./mantenedor-usuarios.component.css'],
  standalone: false
})
export class MantenedorUsuariosComponent implements OnInit {
  loading = false;
  saving = false;

  usuarios: UsuarioListItemDto[] = [];
  filteredUsuarios: UsuarioListItemDto[] = [];
  roles: RolDto[] = [];
  areas: AreaDto[] = [];

  searchTerm = '';
  filterEstado: 'todos' | 'activos' | 'inactivos' | 'bloqueados' = 'todos';

  showPanel = false;
  isEditMode = false;
  selectedUsuario: UsuarioDetailDto | null = null;
  usuarioForm!: FormGroup;

  showPasswordPanel = false;
  passwordForm!: FormGroup;
  passwordTargetUsuario: UsuarioListItemDto | null = null;

  successMessage = '';
  errorMessage = '';

  constructor(
    private usuariosService: UsuariosService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.cargarDatosIniciales();
  }

  initForms(): void {
    this.usuarioForm = this.fb.group({
      usuarioLogin: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', [Validators.minLength(6), Validators.maxLength(100)]],
      codigoEmpleado: ['', [Validators.maxLength(50)]],
      idArea: [''],
      estado: [true],
      requiereReset: [false],
      roleIds: this.fb.array([])
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [this.passwordsMatchValidator]
    });
  }

  passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPwd = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPwd && confirm && newPwd !== confirm ? { mismatch: true } : null;
  }

  get roleIdsArray(): FormArray {
    return this.usuarioForm.get('roleIds') as FormArray;
  }

  cargarDatosIniciales(): void {
    this.loading = true;
    Promise.all([
      this.cargarUsuarios(),
      this.cargarRoles(),
      this.cargarAreas()
    ]).finally(() => {
      this.loading = false;
    });
  }

  cargarUsuarios(): Promise<void> {
    return new Promise((resolve) => {
      this.usuariosService.listarUsuarios().subscribe({
        next: (data) => {
          this.usuarios = data;
          this.aplicarFiltros();
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
          this.showError(err?.error?.message || 'Error al cargar los usuarios');
          resolve();
        }
      });
    });
  }

  cargarRoles(): Promise<void> {
    return new Promise((resolve) => {
      this.usuariosService.obtenerRoles().subscribe({
        next: (data) => {
          this.roles = data;
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar roles:', err);
          resolve();
        }
      });
    });
  }

  cargarAreas(): Promise<void> {
    return new Promise((resolve) => {
      this.usuariosService.obtenerAreas().subscribe({
        next: (data) => {
          this.areas = data;
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar áreas:', err);
          resolve();
        }
      });
    });
  }

  onSearchChange(): void {
    this.aplicarFiltros();
  }

  onEstadoFilterChange(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(u => {
      const matchTerm = !term ||
        u.usuarioLogin.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.codigoEmpleado?.toLowerCase().includes(term) ?? false) ||
        (u.nombreArea?.toLowerCase().includes(term) ?? false) ||
        u.roles.some(r => r.toLowerCase().includes(term));

      let matchEstado = true;
      if (this.filterEstado === 'activos') {
        matchEstado = u.estado && !u.bloqueado;
      } else if (this.filterEstado === 'inactivos') {
        matchEstado = !u.estado;
      } else if (this.filterEstado === 'bloqueados') {
        matchEstado = u.bloqueado;
      }

      return matchTerm && matchEstado;
    });
  }

  openCreatePanel(): void {
    this.isEditMode = false;
    this.selectedUsuario = null;
    this.usuarioForm.reset({
      usuarioLogin: '',
      email: '',
      password: '',
      codigoEmpleado: '',
      idArea: '',
      estado: true,
      requiereReset: false
    });
    this.usuarioForm.get('usuarioLogin')?.enable();
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(100)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.rebuildRoleCheckboxes([]);
    this.showPanel = true;
  }

  openEditPanel(usuario: UsuarioListItemDto): void {
    this.isEditMode = true;
    this.loading = true;
    this.usuariosService.obtenerUsuario(usuario.idUsuario).subscribe({
      next: (detalle) => {
        this.selectedUsuario = detalle;
        this.usuarioForm.patchValue({
          usuarioLogin: detalle.usuarioLogin,
          email: detalle.email,
          password: '',
          codigoEmpleado: detalle.codigoEmpleado || '',
          idArea: detalle.idArea || '',
          estado: detalle.estado,
          requiereReset: detalle.requiereReset
        });
        this.usuarioForm.get('usuarioLogin')?.disable();
        this.usuarioForm.get('password')?.clearValidators();
        this.usuarioForm.get('password')?.updateValueAndValidity();
        this.rebuildRoleCheckboxes(detalle.roles.map(r => r.idRol));
        this.showPanel = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle:', err);
        this.showError(err?.error?.message || 'Error al cargar el detalle del usuario');
        this.loading = false;
      }
    });
  }

  rebuildRoleCheckboxes(rolesSeleccionados: number[]): void {
    const array = this.roleIdsArray;
    while (array.length) {
      array.removeAt(0);
    }
    this.roles.forEach(rol => {
      array.push(new FormControl(rolesSeleccionados.includes(rol.idRol)));
    });
  }

  closePanel(): void {
    this.showPanel = false;
    this.isEditMode = false;
    this.selectedUsuario = null;
    this.usuarioForm.reset();
  }

  getRoleControl(index: number): FormControl {
    return this.roleIdsArray.at(index) as FormControl;
  }

  getSelectedRoleIds(): number[] {
    return this.roles
      .filter((_, idx) => !!this.roleIdsArray.at(idx)?.value)
      .map(r => r.idRol);
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const roleIds = this.getSelectedRoleIds();
    if (roleIds.length === 0) {
      this.showError('Debe seleccionar al menos un rol');
      return;
    }

    if (this.isEditMode) {
      this.actualizarUsuario(roleIds);
    } else {
      this.crearUsuario(roleIds);
    }
  }

  crearUsuario(roleIds: number[]): void {
    const valores = this.usuarioForm.getRawValue();
    const request: CreateUsuarioRequest = {
      usuarioLogin: valores.usuarioLogin.trim(),
      email: valores.email.trim(),
      password: valores.password,
      codigoEmpleado: valores.codigoEmpleado?.trim() || undefined,
      idArea: valores.idArea?.trim() || undefined,
      roleIds
    };

    this.saving = true;
    this.usuariosService.crearUsuario(request).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.showSuccess(resp.message || 'Usuario creado exitosamente');
          this.closePanel();
          this.cargarUsuarios();
        } else {
          this.showError(resp.message || 'No se pudo crear el usuario');
        }
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.showError(err?.error?.message || 'Error al crear el usuario');
        this.saving = false;
      }
    });
  }

  actualizarUsuario(roleIds: number[]): void {
    if (!this.selectedUsuario) return;

    const valores = this.usuarioForm.getRawValue();
    const request: UpdateUsuarioRequest = {
      email: valores.email.trim(),
      codigoEmpleado: valores.codigoEmpleado?.trim() || undefined,
      idArea: valores.idArea?.trim() || undefined,
      estado: !!valores.estado,
      requiereReset: !!valores.requiereReset,
      roleIds
    };

    this.saving = true;
    this.usuariosService.actualizarUsuario(this.selectedUsuario.idUsuario, request).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.showSuccess(resp.message || 'Usuario actualizado exitosamente');
          this.closePanel();
          this.cargarUsuarios();
        } else {
          this.showError(resp.message || 'No se pudo actualizar el usuario');
        }
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        this.showError(err?.error?.message || 'Error al actualizar el usuario');
        this.saving = false;
      }
    });
  }

  toggleEstado(usuario: UsuarioListItemDto): void {
    const accion = usuario.estado ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${accion} al usuario "${usuario.usuarioLogin}"?`)) {
      return;
    }

    const obs = usuario.estado
      ? this.usuariosService.desactivarUsuario(usuario.idUsuario)
      : this.usuariosService.activarUsuario(usuario.idUsuario);

    obs.subscribe({
      next: (resp) => {
        if (resp.success) {
          this.showSuccess(resp.message);
          this.cargarUsuarios();
        } else {
          this.showError(resp.message);
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.showError(err?.error?.message || 'Error al cambiar el estado');
      }
    });
  }

  desbloquear(usuario: UsuarioListItemDto): void {
    if (!confirm(`¿Desbloquear al usuario "${usuario.usuarioLogin}"? Se reiniciarán los intentos fallidos.`)) {
      return;
    }

    this.usuariosService.desbloquearUsuario(usuario.idUsuario).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.showSuccess(resp.message);
          this.cargarUsuarios();
        } else {
          this.showError(resp.message);
        }
      },
      error: (err) => {
        console.error('Error al desbloquear:', err);
        this.showError(err?.error?.message || 'Error al desbloquear');
      }
    });
  }

  openPasswordPanel(usuario: UsuarioListItemDto): void {
    this.passwordTargetUsuario = usuario;
    this.passwordForm.reset({ newPassword: '', confirmPassword: '' });
    this.showPasswordPanel = true;
  }

  closePasswordPanel(): void {
    this.showPasswordPanel = false;
    this.passwordTargetUsuario = null;
    this.passwordForm.reset();
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid || !this.passwordTargetUsuario) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.usuariosService.cambiarPassword({
      targetUserId: this.passwordTargetUsuario.idUsuario,
      newPassword: this.passwordForm.value.newPassword
    }).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.showSuccess(resp.message);
          this.closePasswordPanel();
        } else {
          this.showError(resp.message);
        }
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al cambiar contraseña:', err);
        this.showError(err?.error?.message || 'Error al cambiar la contraseña');
        this.saving = false;
      }
    });
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackUsuario(_index: number, usuario: UsuarioListItemDto): number {
    return usuario.idUsuario;
  }

  trackRol(_index: number, rol: RolDto): number {
    return rol.idRol;
  }

  getEstadoBadgeClass(usuario: UsuarioListItemDto): string {
    if (!usuario.estado) {
      return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
    }
    if (usuario.bloqueado) {
      return 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300';
  }

  getEstadoLabel(usuario: UsuarioListItemDto): string {
    if (!usuario.estado) return 'Inactivo';
    if (usuario.bloqueado) return 'Bloqueado';
    return 'Activo';
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => { this.successMessage = ''; }, 5000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => { this.errorMessage = ''; }, 8000);
  }
}
