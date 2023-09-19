import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const tag = request.nextUrl.pathname.substring(2);
    return NextResponse.rewrite(new URL(`/user/${tag}/`, request.url));
}

export const config = {
    matcher: "/:tag(@.*)",
};
