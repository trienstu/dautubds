import { type SchemaTypeDefinition } from 'sanity'
import { projectType } from './project'
import { postType } from './post'
import { pageType } from './page'
import event from './event'
import developer from './developer'
import seo from './seo'
import author from './author'
import siteConfig from './siteConfig'
import { youtubeType } from './youtube'
import { imageGrid } from './imageGrid'
import { leadType } from './lead'
import { imageSlider } from './imageSlider'
import { tableBlock } from './tableBlock'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, postType, pageType, author, developer, event, siteConfig, seo, youtubeType, imageGrid, leadType, imageSlider, tableBlock],
}
