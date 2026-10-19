import { NextResponse } from "next/server";
import { softDeleteItem } from "../_store";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
    const { id } = await params;
    const item = softDeleteItem(id);
    if (!item) {
        return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({
        success: true,
        message: "Item deleted successfully",
        data: item,
    });
}
