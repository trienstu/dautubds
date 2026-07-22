/**
 * tableBlock - Bảng với tùy chọn tỉ lệ cột
 * Dùng thay thế cho type 'table' để có thể tùy chỉnh độ rộng từng cột.
 */
export const tableBlock = {
  name: 'tableBlock',
  title: 'Bảng (tùy chỉnh tỉ lệ cột)',
  type: 'object',
  fields: [
    {
      name: 'colWidths',
      title: 'Tỉ lệ cột (%)',
      type: 'string',
      description: 'Nhập tỉ lệ % cho từng cột, ngăn cách bởi dấu phẩy. Ví dụ: "35,65" cho 2 cột | "25,50,25" cho 3 cột. Để trống = tự động đều nhau.',
      placeholder: 'VD: 35,65',
    },
    {
      name: 'rows',
      title: 'Dữ liệu bảng',
      type: 'array',
      of: [{ type: 'tableRow' }],
      description: 'Hàng đầu tiên sẽ được dùng làm tiêu đề bảng (header).',
    },
  ],
  preview: {
    select: {
      rows: 'rows',
      colWidths: 'colWidths',
    },
    prepare(selection: Record<string, any>) {
      const { rows, colWidths } = selection;
      const numRows = rows?.length ?? 0;
      const numCols = rows?.[0]?.cells?.length ?? 0;
      const widthInfo = colWidths ? ` (${colWidths})` : '';
      return {
        title: `Bảng ${numCols} cột × ${numRows} hàng${widthInfo}`,
      };
    },
  },
};
