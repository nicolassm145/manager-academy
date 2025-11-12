import type { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow border-1 border-black sm:rounded-lg">
          <table className={`min-w-full divide-y divide-gray-300 ${className}`}>
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
}

interface TableHeadCellProps {
  children: ReactNode;
  className?: string;
}

export function TableHeadCell({
  children,
  className = "",
}: TableHeadCellProps) {
  return (
    <th
      scope="col"
      className={`px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 ${
        className || "text-left"
      }`}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className = "" }: TableRowProps) {
  return <tr className={`hover:bg-gray-50 ${className}`}>{children}</tr>;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td
      className={`px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-900 ${className}`}
    >
      {children}
    </td>
  );
}
