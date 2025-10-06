# Mesa de Ayuda - Módulo de Gestión de Tickets

## Estructura del Módulo

```
mesa-ayuda/
├── components/          # Componentes reutilizables
│   └── detalle-drawer/  # Drawer para mostrar detalles de tickets
├── models/              # Tipos e interfaces centralizadas
│   ├── index.ts         # Exportaciones centralizadas
│   ├── ticket.model.ts  # Interfaces relacionadas con tickets
│   ├── empresa.model.ts # Interfaces de empresa y proyectos
│   └── categoria.model.ts # Interfaces de categorías
├── pages/               # Páginas/Vistas principales
│   ├── dashboard/       # Vista principal con lista de tickets
│   ├── crear-ticket/    # Formulario para crear nuevos tickets
│   ├── detalle-ticket/  # Vista detallada de un ticket
│   └── nuevo-ticket/    # Alias para crear-ticket
├── services/            # Servicios para comunicación con API
│   ├── ticket.service.ts    # Operaciones CRUD de tickets
│   ├── empresa.service.ts   # Gestión de empresas y proyectos
│   ├── categoria.service.ts # Gestión de categorías
│   └── sla.service.ts       # Gestión de SLAs (pendiente)
├── utils/               # Utilidades compartidas
│   ├── index.ts         # Exportaciones centralizadas
│   ├── style.utils.ts   # Utilidades para estilos CSS
│   └── date.utils.ts    # Utilidades para formateo de fechas
├── mesa-ayuda.module.ts     # Configuración del módulo
└── mesa-ayuda-routing.module.ts # Configuración de rutas
```

## Modelos y Tipos

### Ticket Models
- `TicketDashboardDto`: Datos básicos para vista de dashboard
- `TicketDetalleDto`: Datos completos para vista de detalle
- `LineaTrabajoDto`: Líneas de trabajo/historial del ticket
- `AgregarLineaDto`: Datos para agregar nueva línea de trabajo
- `CrearTicketDto`: Datos para crear nuevo ticket
- `LocalidadDto`: Información de localidades

### Empresa Models
- `Empresa`: Información básica de empresa
- `ProyectoPorEmpresaDto`: Proyectos asociados a una empresa

### Categoria Models
- `Categoria`: Información de categorías jerárquicas

### Enums
- `EstadoTicket`: Estados posibles de un ticket
- `PrioridadTicket`: Niveles de prioridad
- `CanalTicket`: Canales de comunicación

## Utilidades

### StyleUtilsService
Proporciona métodos estáticos para obtener clases CSS consistentes:
- `getPrioridadClass(prioridad: string)`: Clases para badges de prioridad
- `getEstadoClass(estado: string)`: Clases para badges de estado
- `getPrioridadIconClass(prioridad: string)`: Clases para íconos de prioridad
- `getEstadoIconClass(estado: string)`: Clases para íconos de estado

### DateUtilsService
Proporciona métodos estáticos para formateo de fechas:
- `formatearFecha(fecha: string)`: Formato dd/mm/yyyy hh:mm
- `formatearFechaSoloFecha(fecha: string)`: Solo fecha sin hora
- `formatearFechaCompleta(fecha: string)`: Formato completo en español
- `tiempoTranscurrido(fecha: string)`: Tiempo relativo (ej: "hace 2 horas")
- `estaVencida(fecha: string)`: Verifica si una fecha está vencida

## Servicios

### TicketService
- Gestión completa de tickets (CRUD)
- Operaciones de dashboard y detalle
- Gestión de líneas de trabajo
- Operaciones administrativas

### EmpresaService
- Listado y búsqueda de empresas
- Obtención de proyectos por empresa

### CategoriaService
- Gestión de categorías jerárquicas
- Navegación por niveles de categoría

## Componentes

### DashboardComponent
Vista principal con:
- Lista de tickets en formato mosaico o tabla
- Filtros por estado, prioridad y búsqueda
- Navegación a detalle de tickets

### CrearTicketComponent
Formulario para crear nuevos tickets con:
- Validaciones reactivas
- Carga dinámica de empresas, proyectos y categorías
- Subida de archivos adjuntos

### DetalleTicketComponent
Vista completa de un ticket con:
- Información detallada
- Historial de líneas de trabajo
- Opciones de gestión

### DetalleDrawerComponent
Drawer lateral para vista rápida de detalles

## Mejoras Implementadas

1. **Centralización de Tipos**: Todos los tipos e interfaces están organizados en la carpeta `models/`
2. **Eliminación de Duplicación**: Los métodos duplicados se movieron a utilidades compartidas
3. **Imports Centralizados**: Uso de barrel exports para facilitar imports
4. **Separación de Responsabilidades**: Lógica de negocio separada de la presentación
5. **Reutilización de Código**: Utilidades compartidas para estilos y fechas
6. **Documentación**: README con estructura y uso del módulo

## Uso

### Importar Tipos
```typescript
import { TicketDashboardDto, Empresa, Categoria } from '../../models';
```

### Usar Utilidades
```typescript
import { StyleUtilsService, DateUtilsService } from '../../utils';

// En el componente
getPrioridadClass(prioridad: string): string {
  return StyleUtilsService.getPrioridadClass(prioridad);
}

formatearFecha(fecha: string): string {
  return DateUtilsService.formatearFecha(fecha);
}
```

### Inyectar Servicios
```typescript
constructor(
  private ticketService: TicketService,
  private empresaService: EmpresaService,
  private categoriaService: CategoriaService
) {}
```

## Próximas Mejoras

1. Completar implementación de `sla.service.ts`
2. Agregar tests unitarios para utilidades
3. Implementar cache para servicios
4. Agregar validaciones personalizadas
5. Mejorar manejo de errores
6. Agregar interceptores HTTP