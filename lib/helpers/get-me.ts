import { MeUser } from "@/@types/user";
import { cookies } from "next/headers";

export async function getMe(): Promise<MeUser | null> {
  const cookieStore = await cookies();

  // Properly serialize cookies into "name=value; name2=value2" format
  const allCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  console.log("cookies found:", allCookies); // check Vercel logs
  if (!allCookies) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`, {
      headers: {
        Cookie: allCookies,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()).data as MeUser;
  } catch (error) {
    return null;
  }
}
