import { NextRequest, NextResponse } from "next/server";
import { listItems } from "../_store";

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") ?? undefined;
    const page = Number(req.nextUrl.searchParams.get("page") || 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") || 10);
    const all = listItems(search);
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);

    return NextResponse.json({
        success: true,
        message: "Items fetched successfully",
        data,
        pagination: {
            page,
            limit,
            totalRecords: all.length,
            hasNextPage: start + limit < all.length,
            hasPreviousPage: page > 1,
        },
    });
}
