"use server";
 
 import { cookies } from "next/headers";
 import { redirect } from "next/navigation";
 import { isRedirectError } from "next/dist/client/components/redirect-error";
 
 import { envServer } from "@/config/env.server";
 import { authService } from "@/features/auth/services/auth.service";
 
 export async function logoutAction(): Promise<void> {
   try {
     const cookieStore = await cookies();
     const accessToken = cookieStore.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value;
 
     if (accessToken) {
       // We call backend logout but don't strictly wait for it to clear local cookies
       // to ensure the user is logged out locally even if the backend call fails.
       try {
         await authService.logout(accessToken);
       } catch (error) {
         console.error("Backend logout failed:", error);
       }
     }
 
     // Clear cookies locally
     cookieStore.set({
       httpOnly: true,
       maxAge: 0,
       name: envServer.ACCESS_TOKEN_COOKIE_NAME,
       path: "/",
       sameSite: "lax",
       secure: process.env.NODE_ENV === "production",
       value: "",
     });
 
     cookieStore.set({
       httpOnly: true,
       maxAge: 0,
       name: envServer.REFRESH_TOKEN_COOKIE_NAME,
       path: "/",
       sameSite: "strict",
       secure: process.env.NODE_ENV === "production",
       value: "",
     });
 
     redirect("/login");
   } catch (error) {
     if (isRedirectError(error)) {
       throw error;
     }
     console.error("Logout action failed:", error);
     redirect("/login");
   }
 }
