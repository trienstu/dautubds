import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Để đảm bảo dữ liệu mới luôn được cập nhật ngay lập tức
})
