import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ tags: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  const tags = await prisma.tag.findMany({
    where: query
      ? { name: { contains: query, mode: "insensitive" } }
      : {},
    orderBy: { name: "asc" },
    take: 8,
    select: { name: true },
  });

  return NextResponse.json({ tags: tags.map((tag) => tag.name) });
}
