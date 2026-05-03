import type { Metadata } from "next";
import "./globals.css";
import { OnboardingProvider } from "./context/OnboardingContext";

export const metadata: Metadata = {
  title: "ReadyKiddo – Your Child's Learning Adventure",
  description: "Personalized learning for kids ages 3–11",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <OnboardingProvider>{children}</OnboardingProvider>
      </body>
    </html>
  );
}
