import { NextRequest, NextResponse } from "next/server";
import { createItem } from "../_store";

export async function POST(req: NextRequest) {
    const body = (await req.json()) as {
        title?: string;
        description?: string | null;
        status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    };

    if (!body.title?.trim()) {
        return NextResponse.json(
            {
                success: false,
                message: "Validation failed",
                errors: [{ path: ["title"], message: "title is required" }],
            },
            { status: 400 },
        );
    }

    const item = createItem({
        title: body.title.trim(),
        description: body.description,
        status: body.status,
    });

    return NextResponse.json(
        { success: true, message: "Item created successfully", data: item },
        { status: 201 },
    );
}
