const fs = require('fs');
const files = [
  'sanity/schemaTypes/post.ts',
  'sanity/schemaTypes/project.ts',
  'sanity/schemaTypes/page.ts',
  'sanity/schemaTypes/developer.ts'
];

const newMarks = `marks: {
            decorators: [
              { title: 'Đậm (Bold)', value: 'strong' },
              { title: 'Nghiêng (Italic)', value: 'em' },
              { title: 'Gạch dưới (Underline)', value: 'underline' },
              { title: 'Gạch ngang (Strike)', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'textAlign',
                type: 'object',
                title: 'Canh lề',
                icon: TextAlignIcon,
                components: {
                  annotation: TextAlignRender
                },
                fields: [
                  {
                    name: 'align',
                    type: 'string',
                    title: 'Chọn kiểu canh lề',
                    options: {
                      list: [
                        { title: 'Trái', value: 'left' },
                        { title: 'Giữa', value: 'center' },
                        { title: 'Phải', value: 'right' },
                        { title: 'Đều 2 bên', value: 'justify' }
                      ],
                      layout: 'radio'
                    }
                  }
                ]
              }
            ]
          }`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Clean up old imports
  content = content.replace(
    /import \{ AlignLeftIcon.*?TextAlignDecorators'.*?\n/g,
    ""
  );
  if(!content.includes('TextAlignAnnotation')) {
    content = "import { TextAlignIcon, TextAlignRender } from '../components/TextAlignAnnotation';\n" + content;
  }

  // Replace everything between marks: { ... } (non-greedy) until the closing }
  // Since it's tricky, we'll replace the exact decorators block.
  content = content.replace(/marks:\s*\{\s*decorators:\s*\[[\s\S]*?\]\s*\}/g, newMarks);
  
  fs.writeFileSync(file, content);
});
console.log('Done fixing');
