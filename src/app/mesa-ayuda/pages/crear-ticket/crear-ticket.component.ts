import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { EmpresaService } from '../../services/empresa.service';
import { CategoriaService } from '../../services/categoria.service';
import { forkJoin, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { 
  LocalidadDto, 
  Empresa, 
  ProyectoPorEmpresaDto, 
  Categoria,
  PrioridadDto,
  nivelAtencionDto,
  ResolutorDto,
  EmpleadoDto,
  SlaDto
} from '../../models';
import { LocalidadService } from '../../services/localidad.service';
import { PrioridadService } from '../../services/prioridad.service';
import {EmpleadoService} from '../../services/empleado.service';

@Component({
  selector: 'app-crear-ticket',
  templateUrl: './crear-ticket.component.html',
  styleUrls: ['./crear-ticket.component.css'],
  standalone: false
})
export class CrearTicketComponent implements OnInit {
  ticketForm: FormGroup;
  loading = false;
  loadingData = true;
  
  // Listas para selects
  empresas: Empresa[] = [];
  categorias: Categoria[] = [];
  categoriasNivel1: Categoria[] = [];
  categoriasNivel2: Categoria[] = [];
  categoriasNivel3: Categoria[] = [];
  proyectos: ProyectoPorEmpresaDto[] = [];
  prioridades: PrioridadDto[] = [] ;
  localidades: LocalidadDto[] = [];
  // Copia total y lista filtrada de localidades
  todasLocalidades: LocalidadDto[] = [];
  localidadesFiltradas: LocalidadDto[] = [];
  usuariosResponsablesOptions: ResolutorDto[] = [];
  usuariosAfectadosOptions: EmpleadoDto[] = [];
  // Lista completa para filtrar por empresa
  todosUsuariosAfectados: EmpleadoDto[] = [];
  
  // Autocomplete observables
  filteredUsuariosResponsables!: Observable<ResolutorDto[]>;
  filteredUsuariosAfectados!: Observable<EmpleadoDto[]>;
  
  // Control de archivos
  archivosAdjuntos: File[] = [];
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ticketService: TicketService,
    private empresaService: EmpresaService,
    private categoriaService: CategoriaService,
    private localidadService: LocalidadService,
    private prioridadService: PrioridadService,
    private empleadoService: EmpleadoService,
  ) {
    this.ticketForm = this.fb.group({
      empresaId: ['', Validators.required],
      usuarioAfectado: ['', [Validators.required, this.usuarioAfectadoValidator]],
      usuarioResponsable: ['', [Validators.required, this.usuarioResponsableValidator]],
      categoria1: ['', Validators.required],
      categoria2: [''],
      categoria3: [''],
      proyectoId: [''],
      prioridad: ['', Validators.required],
      localidad: ['', Validators.required],
      detalleEvento: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.configurarCambiosCategoria();
  }

  cargarDatosIniciales(): void {
    this.loadingData = true;
    
    forkJoin({
      empresas: this.empresaService.obtenerEmpresas(),
      categorias: this.categoriaService.obtenerCategorias(),
      localidades: this.localidadService.obtenerLocalidades(),
      prioridades: this.prioridadService.obtenerTipoDePrioridades(),
      usuariosAfectadosOptions: this.empleadoService.obtenerEmpleados(),
      usuariosResponsablesOptions: this.empleadoService.obtenerResolutores()
    }).subscribe({
      next: (data) => {
        this.empresas = data.empresas;
        this.categorias = data.categorias;
        this.todasLocalidades = data.localidades;
        this.localidadesFiltradas = [];
        this.prioridades = data.prioridades;
        // Guardar todos los empleados y dejar vacío hasta seleccionar empresa
        this.todosUsuariosAfectados = data.usuariosAfectadosOptions;
        this.usuariosAfectadosOptions = [];
        this.usuariosResponsablesOptions = data.usuariosResponsablesOptions;

        // Filtrar categorías por tipo
        this.categoriasNivel1 = this.categorias.filter(c => c.tipo === 'P');
        this.categoriasNivel2 = this.categorias.filter(c => c.tipo === 'T');
        
        // Cargar datos dummy para nuevos campos
        //this.cargarUsuariosResponsablesDummy();
        
        // Configurar autocomplete después de cargar los datos
        this.configurarAutocomplete();
        
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
        this.loadingData = false;
        alert('Error al cargar los datos necesarios. Por favor, intente nuevamente.');
      }
    });
  }

  configurarCambiosCategoria(): void {
    // Cuando cambia categoria nivel 1 (Principal) - No filtra nada
    this.ticketForm.get('categoria1')?.valueChanges.subscribe(categoriaId => {
      // La categoría principal no afecta el filtrado de las demás
      // Solo limpiamos los valores si se cambia
      if (categoriaId) {
        this.ticketForm.patchValue({ categoria2: '', categoria3: '' });
        this.categoriasNivel3 = [];
      }
    });

    // Cuando cambia categoria nivel 2 (Tipo) - Filtra categoria nivel 3 (Subtipo)
    this.ticketForm.get('categoria2')?.valueChanges.subscribe(categoriaId => {
      if (categoriaId) {
        this.categoriasNivel3 = this.categorias.filter(c =>
          c.tipo === 'S' && c.idCategoriaPadre === parseInt(categoriaId)
        );
        this.ticketForm.patchValue({ categoria3: '' });
      } else {
        this.categoriasNivel3 = [];
        this.ticketForm.patchValue({ categoria3: '' });
      }
    });

    // Cuando cambia la empresa, cargar proyectos y filtrar usuarios afectados
    this.ticketForm.get('empresaId')?.valueChanges.subscribe(empresaId => {
      if (empresaId) {
        const empresaIdNum = typeof empresaId === 'string' ? parseInt(empresaId, 10) : empresaId;
        this.cargarProyectos(empresaIdNum);

        const empresaSeleccionada = this.empresas.find(e => e.idEmpresa === empresaIdNum);
        const razon = empresaSeleccionada?.razonSocial || '';
        this.usuariosAfectadosOptions = this.todosUsuariosAfectados.filter(u => u.rucEmpresa === razon);

        // Limpiar selección si no pertenece al filtro actual
        const actual = this.ticketForm.get('usuarioAfectado')?.value;
        if (!actual || !this.usuariosAfectadosOptions.some(u => u.idEmpleado === actual?.idEmpleado)) {
          this.ticketForm.patchValue({ usuarioAfectado: '' });
        }

        // Filtrar localidades según empresa y usuario afectado
        this.filtrarLocalidades();
      } else {
        // Sin empresa seleccionada, no mostrar usuarios afectados
        this.usuariosAfectadosOptions = [];
        this.ticketForm.patchValue({ usuarioAfectado: '' });
        // Limpiar localidades
        this.localidadesFiltradas = [];
        this.ticketForm.patchValue({ localidad: '' });
      }
    });

    // Cuando cambia el usuario afectado, filtrar localidades
    this.ticketForm.get('usuarioAfectado')?.valueChanges.subscribe(() => {
      this.filtrarLocalidades();
    });
  }

  private filtrarLocalidades(): void {
    const empresaId = this.ticketForm.get('empresaId')?.value;
    const usuarioAfectado = this.ticketForm.get('usuarioAfectado')?.value as EmpleadoDto | string | null;

    if (!empresaId || !usuarioAfectado || typeof usuarioAfectado === 'string' || !usuarioAfectado.idDepartamento) {
      this.localidadesFiltradas = [];
      this.ticketForm.patchValue({ localidad: '' });
      return;
    }

    const empresaIdNum = typeof empresaId === 'string' ? parseInt(empresaId, 10) : empresaId;
    const empresaSeleccionada = this.empresas.find(e => e.idEmpresa === empresaIdNum);
    const nombreEmpresa = empresaSeleccionada?.nombre || '';
    const idDepartamentoEmpleado = usuarioAfectado.idDepartamento;

    this.localidadesFiltradas = this.todasLocalidades.filter(l =>
      l.empresaOrigen === nombreEmpresa && l.idDepartamento === idDepartamentoEmpleado
    );

    // Si la selección actual de localidad no está en el filtro, limpiar
    const localidadActual = this.ticketForm.get('localidad')?.value;
    if (!this.localidadesFiltradas.some(l => l.idDepartamento === localidadActual)) {
      this.ticketForm.patchValue({ localidad: '' });
    }
  }

  cargarProyectos(empresaId: number): void {
    this.empresaService.obtenerProyectosPorEmpresa(empresaId).subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos;
      },
      error: (err) => {
        console.error('Error al cargar proyectos:', err);
        this.proyectos = [];
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      
      // Validar tamaño y tipo
      for (const file of filesArray) {
        if (file.size > this.maxFileSize) {
          alert(`El archivo ${file.name} excede el tamaño máximo de 10MB`);
          return;
        }
      }
      
      this.archivosAdjuntos = [...this.archivosAdjuntos, ...filesArray];
    }
  }

  eliminarArchivo(index: number): void {
    this.archivosAdjuntos.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  guardarTicket(): void {
    if (this.ticketForm.valid) {
      this.loading = true;
      
      const formData = new FormData();
      
      // Agregar campos del formulario
      const usuarioAfectado = this.ticketForm.value.usuarioAfectado?.idEmpleado;
      const usuarioResponsable = this.ticketForm.value.usuarioResponsable?.idEmpleado;
      
      const ticketData = {
        idUsuarioCreador: 'S000109',
        idUsuarioAfectado: typeof usuarioAfectado === 'string' ? usuarioAfectado : "",
        idUsuarioResponsable: typeof usuarioResponsable === 'string' ? usuarioResponsable : "",
        idEmpresa: parseInt(this.ticketForm.value.empresaId),
        idCategoria1: parseInt(this.ticketForm.value.categoria1) || null,
        idCategoria2: parseInt(this.ticketForm.value.categoria2) || null,
        idCategoria3: parseInt(this.ticketForm.value.categoria3) || null,
        idProyecto: this.ticketForm.value.proyectoId || null,
        idPrioridad: parseInt(this.ticketForm.value.prioridad),
        idLocalidad: this.ticketForm.value.localidad,
        IdCanal: 1, // Canal fijo para creación manual
        detalleEvento: this.ticketForm.value.detalleEvento,
        estado: 'A' // Estado ASIGNADO para tickets creados manualmente
      };
      
      formData.append('ticket', JSON.stringify(ticketData));
      
      // Agregar archivos adjuntos
      this.archivosAdjuntos.forEach((archivo, index) => {
        formData.append(`archivo_${index}`, archivo);
      });
      
      this.ticketService.crearTicket(formData).subscribe({
        next: (response) => {
          this.loading = false;
          alert('Ticket creado exitosamente');
          this.router.navigate(['/mesa-ayuda']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al crear ticket:', err);
          alert('Error al crear el ticket. Por favor, intente nuevamente.');
        }
      });
    } else {
      this.marcarCamposInvalidos();
    }
  }

  obtenerCategoriasSeleccionadas(): string {
    const categorias = [];
    
    if (this.ticketForm.value.categoria1) {
      const cat1 = this.categorias.find(c => c.idCategoria === parseInt(this.ticketForm.value.categoria1));
      if (cat1) categorias.push(cat1.nombre);
    }
    
    if (this.ticketForm.value.categoria2) {
      const cat2 = this.categorias.find(c => c.idCategoria === parseInt(this.ticketForm.value.categoria2));
      if (cat2) categorias.push(cat2.nombre);
    }
    
    if (this.ticketForm.value.categoria3) {
      const cat3 = this.categorias.find(c => c.idCategoria === parseInt(this.ticketForm.value.categoria3));
      if (cat3) categorias.push(cat3.nombre);
    }
    
    return categorias.join(' > ');
  }

  marcarCamposInvalidos(): void {
    Object.keys(this.ticketForm.controls).forEach(key => {
      const control = this.ticketForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }  

  configurarAutocomplete(): void {
    // Configurar autocomplete para Usuario Responsable
    this.filteredUsuariosResponsables = this.ticketForm.get('usuarioResponsable')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const nombre = typeof value === 'string' ? value : value?.nombre;
        return nombre ? this._filterUsuariosResponsables(nombre) : this.usuariosResponsablesOptions.slice();
      })
    );

    // Configurar autocomplete para Usuario Afectado
    this.filteredUsuariosAfectados = this.ticketForm.get('usuarioAfectado')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const nombre = typeof value === 'string' ? value : value?.nombre;
        return nombre ? this._filterUsuariosAfectados(nombre) : this.usuariosAfectadosOptions.slice();
      })
    );
  }

  private _filterUsuariosResponsables(nombre: string): ResolutorDto[] {
    const filterValue = nombre.toLowerCase();
    return this.usuariosResponsablesOptions.filter(usuario => 
      usuario.nombre.toLowerCase().includes(filterValue) || 
      usuario.puesto.toLowerCase().includes(filterValue)
    );
  }

  private _filterUsuariosAfectados(nombre: string): EmpleadoDto[] {
    const filterValue = nombre.toLowerCase();
    return this.usuariosAfectadosOptions.filter(usuario => 
      usuario.nombre.toLowerCase().includes(filterValue)
    );
  }

  displayUsuarioResponsable(usuario: ResolutorDto): string {
    return usuario && usuario.nombre ? `${usuario.nombre} - ${usuario.puesto}` : '';
  }

  displayUsuarioAfectado(usuario: EmpleadoDto): string {
    return usuario && usuario.nombre ? `${usuario.nombre}` : '';
  }

  usuarioAfectadoValidator(control: any) {
    const value = control.value;
    if (!value) return { required: true };
    if (typeof value === 'string' && value.length < 3) return { minlength: true };
    if (typeof value === 'object' && !value.idEmpleado) return { invalid: true };
    return null;
  }

  usuarioResponsableValidator(control: any) {
    const value = control.value;
    if (!value) return { required: true };
    if (typeof value === 'object' && !value.idEmpleado) return { invalid: true };
    return null;
  }

  cancelar(): void {
    if (confirm('¿Está seguro de cancelar la creación del ticket? Se perderán los datos ingresados.')) {
      this.router.navigate(['/mesa-ayuda']);
    }
  }
}
