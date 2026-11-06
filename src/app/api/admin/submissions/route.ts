import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, clearAllSubmissions } from '@/lib/submissionsStore';

export async function GET(req: NextRequest) {
  try {
    const list = getAllSubmissions();
    return NextResponse.json({
      success: true,
      count: list.length,
      submissions: list,
    });
  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    clearAllSubmissions();
    return NextResponse.json({
      success: true,
      message: 'All submissions cleared successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to clear submissions' },
      { status: 500 }
    );
  }
}
