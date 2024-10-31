import { NextRequest, NextResponse } from 'next/server';
import { moveToNextList } from '@/actions/move-to-next-list';
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return NextResponse.json({ message: 'Nincs azonosítva!' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const result = await moveToNextList(data);
    if (result.error) {
      throw new Error(result.error);
    }
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
