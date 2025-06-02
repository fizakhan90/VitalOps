import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "next-themes"
//import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "VitalOps Dashboard",
  description: "Real-time patient monitoring system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-900">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
