// src/pages/EmployeesPage.tsx
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Employee, Department, EmployeeStatus } from '../types';
import EmployeeTable from '../components/EmployeeTable';
import Pagination from '../components/Pagination';
import StatsBadge from '../components/StatsBadge';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import EmployeeForm from '../components/EmployeeForm';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../hooks/useEmployees';
import { useDebounce } from '../hooks/useDebounce';
import { extractErrorMessage } from '../utils/errorHandler';
import type { EmployeeFormData } from '../schemas/employeeSchema';
import { useHasRole } from '../components/RoleGuard';

const formFieldClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const PAGE_SIZE = 5;
const departments: Department[] = ['Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones', 'Ventas'];
const statuses: EmployeeStatus[] = ['active', 'inactive', 'on_leave'];
const statusLabels: Record<EmployeeStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  on_leave: 'En permiso',
};

// Los parámetros de la URL los puede escribir cualquiera: se validan antes de usarlos
const parsePage = (raw: string | null): number => {
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 1 ? value : 1;
};

const parseOption = <T extends string>(raw: string | null, allowed: readonly T[]): T | '' =>
  allowed.includes(raw as T) ? (raw as T) : '';

function EmployeesPage() {
  // La página ya está restringida por RoleGuard a ADMIN/HR_MANAGER (App.tsx).
  // Eliminar empleados, en la API real, es exclusivo de ADMIN (ni HR_MANAGER
  // puede), por eso la acción se deshabilita según el rol sin bloquear la ruta
  // ni ocultar la sección.
  const canDeleteEmployees = useHasRole(['ADMIN']);

  // La página y los filtros no sensibles viven en la URL; un valor inválido se ignora
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const selectedDepartment = parseOption(searchParams.get('dept'), departments);
  const selectedStatus = parseOption(searchParams.get('status'), statuses);

  // El texto buscado nunca se escribe en la URL (puede contener datos personales);
  // el input lo guarda y la petición usa el valor con debounce
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Estado del servidor: una página de empleados, filtrada. TanStack Query se encarga
  // de pedirla, cachearla y mantenerla sincronizada, sin useEffect ni useState.
  const { data, isLoading: loading, isPlaceholderData, isError, error: queryError, refetch } = useEmployees({
    search: debouncedSearch || undefined,
    department: selectedDepartment || undefined,
    status: selectedStatus || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const employees = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // Segunda query, sin filtros: las estadísticas son sobre el total de empleados,
  // no sobre el filtro activo, por lo que necesitan su propia lista en caché.
  const { data: allData, refetch: refetchAll } = useEmployees({});
  const allEmployees = useMemo(() => allData?.data ?? [], [allData]);
  const totalEmployees = allEmployees.length;
  const activeEmployees = allEmployees.filter(emp => emp.status === 'active').length;
  const onLeaveEmployees = allEmployees.filter(emp => emp.status === 'on_leave').length;
  const inactiveEmployees = allEmployees.filter(emp => emp.status === 'inactive').length;

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  // Estado del modal de creación/edición
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cambia un filtro en la URL y vuelve a la página 1
  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete('page');
    setSearchParams(next);
  };

  // Al buscar solo se vuelve a la página 1; el texto no se refleja en la URL
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchParams.has('page')) {
      const next = new URLSearchParams(searchParams);
      next.delete('page');
      setSearchParams(next, { replace: true });
    }
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleOpenCreate = () => {
    setEditingEmployee(undefined);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setSubmitError(null);
    setModalOpen(true);
  };

  // React Hook Form ya validó los datos con Zod antes de llegar aquí;
  // esta función solo decide si crea o actualiza y llama a la mutación correspondiente.
  const handleSubmit = async (formData: EmployeeFormData) => {
    setSubmitError(null);
    try {
      if (editingEmployee) {
        await updateEmployee.mutateAsync({ id: editingEmployee.id, data: formData });
      } else {
        await createEmployee.mutateAsync(formData);
      }
      setModalOpen(false);
    } catch {
      setSubmitError('No se pudo guardar el empleado. Intenta de nuevo.');
    }
  };

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Empleados</h2>
          <p className="text-slate-500 mt-1">
            {loading ? 'Cargando...' : `${data?.total ?? 0} de ${totalEmployees} empleados`}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo empleado
        </button>
      </div>

      {/* Estadísticas */}
      <div className="flex flex-wrap gap-4 mb-6">
        <StatsBadge label="Total de empleados" value={totalEmployees} variant="blue" />
        <StatsBadge label="Empleados activos" value={activeEmployees} variant="green" />
        <StatsBadge label="Empleados en permiso" value={onLeaveEmployees} variant="yellow" />
        <StatsBadge label="Empleados inactivos" value={inactiveEmployees} variant="red" />
      </div>

      {/* Barra de filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-end gap-3">
        {/* Búsqueda por texto */}
        <FormField label="Buscar" className="flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Buscar por nombre, email o cargo..."
            value={searchInput}
            maxLength={100}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={formFieldClass}
          />
        </FormField>

        {/* Filtro por departamento */}
        <FormField label="Departamento" className="min-w-[180px]">
          <select
            value={selectedDepartment}
            onChange={(e) => updateParams({ dept: e.target.value || undefined })}
            className={formFieldClass}
          >
            <option value="">Todos los departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </FormField>

        {/* Filtro por estado */}
        <FormField label="Estado" className="min-w-[160px]">
          <select
            value={selectedStatus}
            onChange={(e) => updateParams({ status: e.target.value || undefined })}
            className={formFieldClass}
          >
            <option value="">Todos los estados</option>
            {statuses.map(status => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>
        </FormField>

        {/* Botón limpiar filtros */}
        {(searchInput || selectedDepartment || selectedStatus) && (
          <button
            onClick={handleClearFilters}
            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Estado de error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center" role="alert">
          <p className="text-red-700 font-medium">Error al cargar los empleados</p>
          <p className="text-red-500 text-sm mt-1">{extractErrorMessage(queryError)}</p>
          <button
            onClick={() => { refetch(); refetchAll(); }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla y paginación */}
      {!isError && (
        <>
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <EmployeeTable
              employees={employees}
              isLoading={loading}
              onEdit={handleOpenEdit}
              onDelete={canDeleteEmployees ? (id) => deleteEmployee.mutate(id) : undefined}
            />
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isPlaceholderData}
          />
        </>
      )}

      {/* Modal de creación/edición (React Hook Form + Zod) */}
      <Modal
        isOpen={modalOpen}
        title={editingEmployee ? `Editar: ${editingEmployee.name}` : 'Nuevo empleado'}
        onClose={() => setModalOpen(false)}
      >
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={createEmployee.isPending || updateEmployee.isPending}
          error={submitError}
        />
      </Modal>
    </div>
  );
}

export default EmployeesPage;