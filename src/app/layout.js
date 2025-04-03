import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: '--font-manrope',
  weight: ['200', '300', '400', '500', '600', '700', '800']
});

export const metadata = {
  title: "Ask Lumina",
  description: "A smart assistant application powered by OpenAI, designed to assist customers with home theater setup recommendations, FAQs, and product details from Lumina Screens.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-manrope font-medium`}>
        {children}
      </body>
    </html>
  );
}
