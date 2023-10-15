import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Transform /@username to /user/username
    const tag = request.nextUrl.pathname.substring(2);
    return NextResponse.rewrite(new URL(`/user/${tag}/`, request.url));
}

export const config = {
    matcher: "/:tag(@.*)",
};
