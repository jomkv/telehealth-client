import { User } from "@/@types/user";
import { cookies } from "next/headers";

export async function getMe(): Promise<User | null> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();

  if (!allCookies) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`, {
      headers: {
        // Pass the cookies to req
        Cookie: allCookies,
      },
      // Ensure we don't cache stale user data
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()).data as User;
  } catch (error) {
    return null;
  }
}
