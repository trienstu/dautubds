import { type SchemaTypeDefinition } from 'sanity'
import { projectType } from './project'
import { postType } from './post'
import { pageType } from './page'
import { eventType } from './event'
import { developerType } from './developer'
import { seoType } from './seo'
import { authorType } from './author'
import { siteConfigType } from './siteConfig'
import { youtubeType } from './youtube'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, postType, pageType, authorType, developerType, eventType, siteConfigType, seoType, youtubeType],
}
