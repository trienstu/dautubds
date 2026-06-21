const fs = require('fs');
const files = [
  'sanity/schemaTypes/post.ts',
  'sanity/schemaTypes/project.ts',
  'sanity/schemaTypes/page.ts',
  'sanity/schemaTypes/developer.ts'
];

const annotationObj = `annotations: [
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
                    title: 'Chọn kiểu',
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
            ]`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace old import with new import
  content = content.replace(
    /import \{ AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon, AlignLeftRender, AlignCenterRender, AlignRightRender, AlignJustifyRender \} from '\.\.\/components\/TextAlignDecorators'/g,
    "import { TextAlignIcon, TextAlignRender } from '../components/TextAlignAnnotation'"
  );

  // Remove the old decorators
  content = content.replace(/, \{ title: 'Canh trái', value: 'alignLeft', icon: AlignLeftIcon, component: AlignLeftRender \}, \{ title: 'Canh giữa', value: 'alignCenter', icon: AlignCenterIcon, component: AlignCenterRender \}, \{ title: 'Canh phải', value: 'alignRight', icon: AlignRightIcon, component: AlignRightRender \}, \{ title: 'Canh đều( 2 bên)?', value: 'alignJustify', icon: AlignJustifyIcon, component: AlignJustifyRender \}/g, "");
  
  // Also catch the inline page.ts/developer.ts variant
  content = content.replace(/, \{ title: 'Canh trái', value: 'alignLeft', icon: AlignLeftIcon, component: AlignLeftRender \}, \{ title: 'Canh giữa', value: 'alignCenter', icon: AlignCenterIcon, component: AlignCenterRender \}, \{ title: 'Canh phải', value: 'alignRight', icon: AlignRightIcon, component: AlignRightRender \}, \{ title: 'Canh đều', value: 'alignJustify', icon: AlignJustifyIcon, component: AlignJustifyRender \}/g, "");

  // Insert the annotations array after the decorators array
  content = content.replace(/decorators: \[(.*?)\]/g, "decorators: [$1],\n            " + annotationObj);
  
  fs.writeFileSync(file, content);
});
console.log('Done');
