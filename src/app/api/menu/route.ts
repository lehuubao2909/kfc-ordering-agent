/** GET /api/menu — HOẠT ĐỘNG (fixtures). OWNER: Dev A. Query: ?category=&q= */
import { NextRequest, NextResponse } from "next/server";
import { getFullMenu, getMenuByCategory, searchMenuItems } from "@/lib/services/menu-service";
import { apiOk } from "@/lib/types";
import { MenuItem } from "@/lib/types";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const q = req.nextUrl.searchParams.get("q");
  let items;
  if (q) items = await searchMenuItems(q);
  else if (category) items = await getMenuByCategory(category as MenuItem["category"]);
  else items = await getFullMenu();
  return NextResponse.json(apiOk(items));
}
