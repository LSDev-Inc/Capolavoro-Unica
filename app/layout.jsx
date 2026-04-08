import "./globals.css";
import { Space_Grotesk, Manrope } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata = {
  title: "Capolavoro Unica",
  description: "Educational platform with secure authentication and personal notes."
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
