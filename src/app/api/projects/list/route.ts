import { NextResponse } from 'next/server';
import { client } from '../../../../../sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const query = `*[_type == "project"] | order(_updatedAt desc)[0...50]{
      _id,
      title,
      "slug": slug.current,
      category,
      price,
      status,
      progressPercentage
    }`;
    const projects = await client.fetch(query);
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error('Error fetching projects list:', error);
    return NextResponse.json({ error: error.message || 'Lỗi lấy danh sách dự án' }, { status: 500 });
  }
}
