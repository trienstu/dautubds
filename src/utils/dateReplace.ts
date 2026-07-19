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
  
  // Efficiently replace text in the whole portable text JSON structure
  const blocksString = JSON.stringify(blocks);
  const replacedString = replaceDateShortcodes(blocksString);
  
  try {
    return JSON.parse(replacedString);
  } catch (e) {
    console.error("Failed to parse replaced portable text", e);
    return blocks;
  }
}
