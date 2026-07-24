import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "The Grammar Museum — learn English grammar by walking through it",
  description:
    "A walkable 3D museum for Spanish-speaking English learners. Ten themed rooms, one grammar topic each — on desktop, phone or Meta Quest.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
