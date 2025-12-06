'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEye, FaEdit, FaTrash, FaLock, FaKey } from 'react-icons/fa';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  onAction?: (action: string, row: any) => void;
  mobileView?: 'card' | 'table';
  isLoading?: boolean;
}

export default function ResponsiveTable({ 
  columns, 
  data, 
  onRowClick, 
  onAction,
  mobileView = 'card',
  isLoading = false
}: ResponsiveTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleRowExpansion = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Desktop Table View
  const DesktopTable = () => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      <FaChevronUp 
                        className={`text-xs ${
                          sortColumn === column.key && sortDirection === 'asc' 
                            ? 'text-blue-600' 
                            : 'text-gray-400'
                        }`}
                      />
                      <FaChevronDown 
                        className={`text-xs -mt-1 ${
                          sortColumn === column.key && sortDirection === 'desc' 
                            ? 'text-blue-600' 
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr 
              key={row.id || index}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.('view', row);
                    }}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Görüntüle"
                  >
                    <FaEye className="text-sm" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.('edit', row);
                    }}
                    disabled={isLoading}
                    className="text-yellow-600 hover:text-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-yellow-50 transition-colors"
                    title="Düzenle"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.('changePassword', row);
                    }}
                    disabled={isLoading}
                    className="text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-purple-50 transition-colors"
                    title="Şifre Değiştir"
                  >
                    <FaKey className="text-sm" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.('lock', row);
                    }}
                    disabled={isLoading}
                    className="text-orange-600 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-orange-50 transition-colors"
                    title="Kilitle/Kilit Aç"
                  >
                    <FaLock className="text-sm" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.('delete', row);
                    }}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-red-50 transition-colors"
                    title="Sil"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileCardView = () => (
    <div className="lg:hidden space-y-4">
      {sortedData.map((row, index) => {
        const isExpanded = expandedRows.has(row.id || index.toString());
        const primaryColumn = columns[0];
        const secondaryColumns = columns.slice(1, 3);
        const remainingColumns = columns.slice(3);

        return (
          <div key={row.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Primary Info */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {primaryColumn.render ? primaryColumn.render(row[primaryColumn.key], row) : row[primaryColumn.key]}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {secondaryColumns.map((column) => (
                      <span key={column.key} className="text-xs text-gray-500">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.('view', row);
                      }}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Görüntüle"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.('edit', row);
                      }}
                      disabled={isLoading}
                      className="text-yellow-600 hover:text-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-yellow-50 transition-colors"
                      title="Düzenle"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.('changePassword', row);
                      }}
                      disabled={isLoading}
                      className="text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-purple-50 transition-colors"
                      title="Şifre Değiştir"
                    >
                      <FaKey className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.('lock', row);
                      }}
                      disabled={isLoading}
                      className="text-orange-600 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-orange-50 transition-colors"
                      title="Kilitle/Kilit Aç"
                    >
                      <FaLock className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.('delete', row);
                      }}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-red-50 transition-colors"
                      title="Sil"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                  {remainingColumns.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(row.id || index.toString());
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && remainingColumns.length > 0 && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="mt-3 space-y-2">
                  {remainingColumns.map((column) => (
                    <div key={column.key} className="flex justify-between">
                      <span className="text-xs font-medium text-gray-500">{column.label}:</span>
                      <span className="text-xs text-gray-900">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <DesktopTable />
      {mobileView === 'card' ? <MobileCardView /> : null}
    </div>
  );
}
