import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{agent: string}>}
) {
    try {
        const {agent} = await params;
        const searchParams = request.nextUrl.searchParams;
        const rawPage = searchParams.get('page');
        if (!rawPage) {
            return NextResponse.json({message: "Invalid page"}, {status: 400});
        }

        const page = Number.parseInt(rawPage);
        console.log(page);
        console.log(agent);
        return NextResponse.json([], {status: 200});
    } catch (err) {
        console.error("Could not get agent's properties", err);
        return NextResponse.json({ error: "Could not get your properties" }, { status: 500 });
    }
}