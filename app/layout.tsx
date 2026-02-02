import type { Metadata } from "next";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Ben Little - Commerce & Computer Science Student | Portfolio",
  description:
    "Ben Little is a Commerce & Computer Science student at Queen's University. Explore his portfolio featuring projects in web development, software engineering, and business applications.",
  keywords: [
    "Ben Little",
    "Queen's University",
    "Commerce",
    "Computer Science",
    "Web Development",
    "Software Engineering",
    "Portfolio",
    "Student",
  ],
  authors: [{ name: "Ben Little" }],
  openGraph: {
    title: "Ben Little - Commerce & Computer Science Student",
    description:
      "Commerce & Computer Science student at Queen's University passionate about AI, software development, and innovation.",
    url: "https://benlittleswebsite.netlify.app",
    siteName: "Ben Little Portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body className="font-mono bg-black text-white antialiased">{children}</body>
    </html>
  );
}
