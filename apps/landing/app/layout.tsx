import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "The Grammar Museum — walk through English grammar",
  description:
    "A free, walkable 3D museum where you learn English grammar by exploring color-coded rooms — in your browser and in Meta Quest VR.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  )
}
