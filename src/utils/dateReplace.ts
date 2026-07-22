export function replaceDateShortcodes(text: string): string {
  if (!text) return text;
  const now = new Date();
  
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString();
  const date = now.getDate().toString().padStart(2, '0');
  
  let result = text;
  // Replace various formats
  result = result.replace(/\{\{month_year\}\}/g, `${month}/${year}`);
  result = result.replace(/\{\{thang_nam\}\}/g, `${month}/${year}`);
  result = result.replace(/\{\{month\}\}/g, month);
  result = result.replace(/\{\{thang\}\}/g, month);
  result = result.replace(/\{\{year\}\}/g, year);
  result = result.replace(/\{\{nam\}\}/g, year);
  result = result.replace(/\{\{date\}\}/g, `${date}/${month}/${year}`);
  result = result.replace(/\{\{ngay\}\}/g, `${date}/${month}/${year}`);
  
  return result;
}

export function replacePortableTextShortcodes(blocks: any[]): any[] {
  if (!blocks || !Array.isArray(blocks)) return blocks;
  return replaceDeepShortcodes(blocks);
}

export function replaceDeepShortcodes<T>(data: T): T {
  if (!data) return data;
  try {
    const jsonStr = JSON.stringify(data);
    const replaced = replaceDateShortcodes(jsonStr);
    return JSON.parse(replaced);
  } catch (e) {
    console.error("Failed to replace deep shortcodes", e);
    return data;
  }
}
