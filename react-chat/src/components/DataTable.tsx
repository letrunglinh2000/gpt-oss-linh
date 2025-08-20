import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { Column } from '../types';

interface DataTableProps {
  columns: Column[];
  rows: Array<Record<string, any>>;
  pageSize?: number;
  searchable?: boolean;
  sortable?: boolean;
  selectableRows?: boolean;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  pageSize = 25,
  searchable = true,
  sortable = true,
  selectableRows = false,
  className
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = rows;

    // Search filter
    if (searchTerm) {
      filtered = rows.filter(row =>
        columns.some(col =>
          String(row[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [rows, columns, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc' ? { key: columnKey, direction: 'desc' } : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => startIndex + index)));
    }
  };

  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const exportToCsv = () => {
    const headers = columns.map(col => col.header).join(',');
    const csvRows = processedData.map(row =>
      columns.map(col => {
        const value = row[col.key];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    const csv = [headers, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `table-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-2xl glass-glow">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium mb-2 glass-text">No data available</h3>
        <p className="text-sm glass-text opacity-70">There are no rows to display in this table.</p>
      </div>
    );
  }

  return (
    <div className={clsx('glass-card rounded-2xl glass-glow', className)}>
      {/* Header with search and actions */}
      {(searchable || selectableRows) && (
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 glass-text opacity-60" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass-input rounded-2xl focus-ring glass-text"
              />
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {selectedRows.size > 0 && (
              <span className="text-sm glass-text opacity-70 font-medium">
                {selectedRows.size} selected
              </span>
            )}
            <button
              onClick={exportToCsv}
              className="px-4 py-3 text-sm glass-button rounded-xl focus-ring glass-text"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="glass-panel sticky top-0">
            <tr>
              {selectableRows && (
                <th className="w-12 p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded focus-ring accent-blue-400"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'p-4 text-left text-sm font-medium glass-text',
                    {
                      'cursor-pointer glass-hover rounded-xl transition-all duration-300': sortable,
                      'text-right': column.align === 'right',
                      'text-center': column.align === 'center',
                    }
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortable && sortConfig?.key === column.key && (
                      <span className="text-blue-500">
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const globalIndex = startIndex + index;
              return (
                <tr
                  key={globalIndex}
                  className={clsx(
                    'border-b border-white/5 glass-hover transition-all duration-300',
                    {
                      'glass-user-message glass-glow-blue': selectedRows.has(globalIndex),
                    }
                  )}
                >
                  {selectableRows && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(globalIndex)}
                        onChange={() => handleRowSelect(globalIndex)}
                        className="rounded focus-ring accent-blue-400"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={clsx('p-4 text-sm glass-text', {
                        'text-right': column.align === 'right',
                        'text-center': column.align === 'center',
                      })}
                    >
                      {column.formatter ? column.formatter(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm glass-text opacity-70">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, processedData.length)} of{' '}
            {processedData.length} results
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm glass-button rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus-ring glass-text"
            >
              Previous
            </button>
            <span className="text-sm glass-text opacity-70 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm glass-button rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus-ring glass-text"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
