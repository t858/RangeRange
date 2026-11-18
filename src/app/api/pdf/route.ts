import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generatePdfBuffer } from '@/lib/generatePdf';
import { getAllSubmissionsAsync } from '@/lib/submissionsStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const file = searchParams.get('file');
    const id = searchParams.get('id');
    const isDownload = searchParams.get('download') === '1' || searchParams.get('download') === 'true';

    let pdfBuffer: Buffer | null = null;
    let fileName = file ? path.basename(file) : '';

    // 1. Try finding file on local disk
    if (fileName) {
      const filePath = path.join(process.cwd(), 'public', 'submissions', fileName);
      if (fs.existsSync(filePath)) {
        try {
          pdfBuffer = fs.readFileSync(filePath);
        } catch (e) {
          console.warn('Could not read PDF from disk, falling back to dynamic generation:', e);
        }
      }
    }

    // 2. If not found on disk, look up submission data and generate dynamically
    if (!pdfBuffer && (id || fileName)) {
      const submissions = await getAllSubmissionsAsync();
      const sub = submissions.find((s) => s.id === id || (fileName && s.pdfUrl?.includes(fileName)));

      if (sub) {
        pdfBuffer = generatePdfBuffer(sub);
        if (!fileName) {
          const safeName = (sub.firstName || 'Client').replace(/[^a-zA-Z0-9]/g, '');
          const stagePrefix = sub.stage === 'appointment_booked' ? 'Booked' : 'Eligible';
          fileName = `RangeRange_${stagePrefix}_${safeName}_${Date.now()}.pdf`;
        }
      }
    }

    // 3. Fallback: if no match found, generate a sample record
    if (!pdfBuffer) {
      pdfBuffer = generatePdfBuffer({
        firstName: 'RangeRange',
        lastName: 'Client',
        email: 'client@example.com',
      });
      fileName = 'RangeRange_Client_Record.pdf';
    }

    const disposition = isDownload ? 'attachment' : 'inline';

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to serve PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
