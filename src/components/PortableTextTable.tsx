import React from 'react';

interface TableRow {
  _key?: string;
  cells: string[];
}

interface PortableTextTableProps {
  rows: TableRow[];
  /** Chuỗi tỉ lệ cột, VD: "35,65" hoặc "25,50,25". Để undefined = tự động. */
  colWidths?: string;
}

/**
 * Shared table renderer for portable text content.
 * Supports custom column width ratios via colWidths prop.
 */
export function renderTable(rows: TableRow[], colWidths?: string) {
  if (!rows || rows.length === 0) return null;

  const [head, ...bodyRows] = rows;
  const numCols = head?.cells?.length ?? 1;

  // Parse column widths
  let parsedWidths: string[] | null = null;
  if (colWidths && colWidths.trim()) {
    const parts = colWidths.split(',').map((p) => `${parseFloat(p.trim())}%`);
    if (parts.length === numCols && parts.every((p) => !isNaN(parseFloat(p)))) {
      parsedWidths = parts;
    }
  }

  // Default: 35/65 for 2-col tables, equal for others
  if (!parsedWidths) {
    if (numCols === 2) {
      parsedWidths = ['35%', '65%'];
    } else {
      parsedWidths = Array(numCols).fill(`${(100 / numCols).toFixed(1)}%`);
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
        margin: '1rem 0',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          tableLayout: 'fixed',
          wordBreak: 'break-word',
        }}
      >
        <colgroup>
          {parsedWidths.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>

        {head && head.cells && (
          <thead style={{ background: 'var(--color-dark-light)' }}>
            <tr>
              {head.cells.map((cell: string, i: number) => (
                <th
                  key={i}
                  style={{
                    borderBottom: '2px solid var(--border-color)',
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    whiteSpace: 'normal',
                    verticalAlign: 'top',
                  }}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {bodyRows.map((row: TableRow, i: number) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--color-secondary)',
              }}
            >
              {row.cells.map((cell: string, j: number) => (
                <td
                  key={j}
                  style={{
                    padding: '12px 16px',
                    color: 'var(--color-text)',
                    whiteSpace: 'normal',
                    verticalAlign: 'top',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PortableTextTable({ rows, colWidths }: PortableTextTableProps) {
  return renderTable(rows, colWidths) as React.ReactElement;
}
