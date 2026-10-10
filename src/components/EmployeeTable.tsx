// src/components/EmployeeTable.tsx
import type { Employee } from '../types';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

const statusConfig = {
  active: { label: 'Activo', classes: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactivo', classes: 'bg-red-100 text-red-800' },
  on_leave: { label: 'En permiso', classes: 'bg-yellow-100 text-yellow-800' },
};

const columns = ['Empleado', 'Departamento', 'Cargo', 'Salario', 'Ingreso', 'Estado', 'Acciones'];

function EmployeeTable({ employees, onEdit, onDelete, isLoading }: EmployeeTableProps) {
  const formatSalary = (amount: number) =>
    new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('es-GT', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mr-3" />
        <span>Cargando empleados...</span>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <span className="text-4xl block mb-3">🔍</span>
        <p>No se encontraron empleados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map(col => (
              <th
                key={col}
                className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap"
                scope="col"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map(emp => (
            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
              {/* Empleado */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
                    {emp.avatarUrl
                      ? <img src={emp.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : emp.name.charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{emp.name}</p>
                    <p className="text-xs text-slate-400">{emp.email}</p>
                  </div>
                </div>
              </td>

              {/* Departamento */}
              <td className="px-4 py-3 text-slate-600">{emp.department}</td>

              {/* Cargo */}
              <td className="px-4 py-3 text-slate-600">{emp.position}</td>

              {/* Salario */}
              <td className="px-4 py-3 font-medium text-slate-900">
                {formatSalary(emp.salary)}
              </td>

              {/* Fecha de ingreso */}
              <td className="px-4 py-3 text-slate-500">{formatDate(emp.hireDate)}</td>

              {/* Estado */}
              <td className="px-4 py-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[emp.status].classes}`}>
                  {statusConfig[emp.status].label}
                </span>
              </td>

              {/* Acciones */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(emp)}
                      className="text-xs px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      aria-label={`Editar a ${emp.name}`}
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${emp.name}?`)) onDelete(emp.id);
                      }}
                      className="text-xs px-2.5 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      aria-label={`Eliminar a ${emp.name}`}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;