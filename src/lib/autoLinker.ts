export interface LinkTarget {
  keyword: string;
  url: string;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function applyInternalLinks(blocks: any[], linkTargets: LinkTarget[]) {
  if (!blocks || !Array.isArray(blocks) || linkTargets.length === 0) return blocks;

  // Sort by keyword length descending to avoid partial matches
  const sortedTargets = [...linkTargets]
    .filter(t => t.keyword && t.url)
    .sort((a, b) => b.keyword.length - a.keyword.length);

  const linkedKeywords = new Set<string>();

  // Deep clone to avoid mutating original state
  const newBlocks = JSON.parse(JSON.stringify(blocks));

  for (const block of newBlocks) {
    if (block._type !== 'block' || !block.children) continue;
    
    let children = block.children;
    let i = 0;
    
    while (i < children.length) {
      const child = children[i];
      
      // Check if this span is already part of a link
      const hasLink = child.marks?.some((mark: string) => {
        const markDef = block.markDefs?.find((def: any) => def._key === mark);
        return markDef && markDef._type === 'link';
      });

      if (child._type === 'span' && child.text && !hasLink) {
        let textToProcess = child.text;
        let matched = false;

        for (const target of sortedTargets) {
          if (linkedKeywords.has(target.keyword.toLowerCase())) continue;

          // Find exact match with boundaries
          const regex = new RegExp(`(^|\\s|[.,!?;:()\\"'])(${escapeRegExp(target.keyword)})($|\\s|[.,!?;:()\\"'])`, 'i');
          const match = textToProcess.match(regex);

          if (match) {
            const prefix = match[1];
            const matchedKeyword = match[2];
            const beforeMatch = textToProcess.substring(0, match.index! + prefix.length);
            const afterMatch = textToProcess.substring(match.index! + prefix.length + matchedKeyword.length);

            // Create a unique key for the markDef
            const linkKey = `link_${Math.random().toString(36).substring(2, 9)}`;
            
            if (!block.markDefs) block.markDefs = [];
            block.markDefs.push({
              _key: linkKey,
              _type: 'link',
              href: target.url
            });

            // Create new spans
            const newChildren = [];
            if (beforeMatch) {
              newChildren.push({ ...child, text: beforeMatch });
            }
            
            newChildren.push({
              ...child,
              text: matchedKeyword,
              marks: [...(child.marks || []), linkKey]
            });
            
            if (afterMatch) {
              newChildren.push({ ...child, text: afterMatch });
            }

            // Replace current child with new children
            children.splice(i, 1, ...newChildren);
            
            linkedKeywords.add(target.keyword.toLowerCase());
            matched = true;
            
            // Advance index to the 'afterMatch' span
            i += beforeMatch ? 1 : 0;
            break; // Break inner loop, continue `while` loop at `i` (which is now the 'matchedKeyword' span)
                   // Wait, if I advance `i += beforeMatch ? 1 : 0`, I am at the `matchedKeyword` span.
                   // The loop will then `i++` inside the `if(!matched)`? No! 
                   // I should advance `i` past the matched block so it processes the afterMatch block next.
          }
        }
        
        if (matched) {
           i++; // Advance past the matched block. We will process `afterMatch` in the next iteration.
        } else {
           i++; // No match, move to next child
        }
      } else {
        i++;
      }
    }
  }

  return newBlocks;
}
