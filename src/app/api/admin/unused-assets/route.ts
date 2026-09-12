import { NextResponse } from 'next/server';
import { client } from '../../../../../sanity/lib/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// GET: Quét và lấy danh sách tất cả các ảnh mồ côi (không được bài viết/dự án nào sử dụng)
export async function GET() {
  try {
    const sanityToken = process.env.SANITY_API_TOKEN;
    if (!sanityToken) {
      return NextResponse.json({ error: 'Thiếu SANITY_API_TOKEN trong file .env.local' }, { status: 500 });
    }

    const adminClient = client.withConfig({ token: sanityToken });

    const query = `*[_type == "sanity.imageAsset" && count(*[references(^._id)]) == 0] | order(_createdAt desc) {
      _id,
      originalFilename,
      size,
      url,
      _createdAt,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        }
      }
    }`;

    const assets = await adminClient.fetch(query);
    const totalSizeBytes = assets.reduce((acc: number, a: any) => acc + (a.size || 0), 0);
    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

    return NextResponse.json({
      success: true,
      totalCount: assets.length,
      totalSizeBytes,
      totalSizeMB,
      assets
    });
  } catch (error: any) {
    console.error('Lỗi quét ảnh không sử dụng:', error);
    return NextResponse.json({ error: error.message || 'Lỗi quét ảnh trên Sanity' }, { status: 500 });
  }
}

// DELETE: Xóa 1 ảnh hoặc xóa hàng loạt ảnh thừa theo danh sách assetIds
export async function DELETE(request: Request) {
  try {
    const sanityToken = process.env.SANITY_API_TOKEN;
    if (!sanityToken) {
      return NextResponse.json({ error: 'Thiếu SANITY_API_TOKEN trong file .env.local' }, { status: 500 });
    }

    const { assetIds, assetId } = await request.json();

    let idsToDelete: string[] = [];
    if (Array.isArray(assetIds)) {
      idsToDelete = assetIds.filter((id: any) => typeof id === 'string' && id.trim().length > 0);
    } else if (typeof assetId === 'string' && assetId.trim().length > 0) {
      idsToDelete = [assetId.trim()];
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'Vui lòng cung cấp danh sách assetId cần xóa' }, { status: 400 });
    }

    const adminClient = client.withConfig({ token: sanityToken });

    // Xóa theo batch (mỗi batch 25 ảnh để tránh quá tải transaction)
    let deletedCount = 0;
    const batchSize = 25;

    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const chunk = idsToDelete.slice(i, i + batchSize);
      let tx = adminClient.transaction();
      for (const id of chunk) {
        tx = tx.delete(id);
      }
      await tx.commit();
      deletedCount += chunk.length;
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Đã xóa thành công ${deletedCount} ảnh không sử dụng khỏi Sanity!`
    });
  } catch (error: any) {
    console.error('Lỗi khi xóa ảnh trên Sanity:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi xóa ảnh trên Sanity' }, { status: 500 });
  }
}
