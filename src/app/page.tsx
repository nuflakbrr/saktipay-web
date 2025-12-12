'use client'
import { FC, useEffect } from "react"
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/Common/CustomIcons"
import { useTheme } from "next-themes";

const AuthPage: FC = () => {
  const { signIn, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "cashier")) {
      router.push("/dashboard");
    }

  }, [user, router]);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <img src={theme === "light" ? "/saktipay-logo.png" : "/saktipay-logo-dark.png"} alt="Logo" loading="lazy" className="w-64 mb-4" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Masuk</CardTitle>
          <CardDescription>
            Silahkan masuk menggunakan akun Google Anda untuk melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-2">
          <Button variant="outline" className="w-full" onClick={signIn}>
            <GoogleIcon />
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}

export default AuthPage;