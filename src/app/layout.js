import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ask Lumina",
  description: "A smart assistant application powered by OpenAI, designed to assist customers with home theater setup recommendations, FAQs, and product details from Lumina Screens.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
