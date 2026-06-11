import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schema } from './sanity/schemaTypes'
import { projectId, dataset } from './sanity/env'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  title: 'Quản Trị Bất Động Sản',
  schema,
  plugins: [structureTool(), visionTool()],
})
