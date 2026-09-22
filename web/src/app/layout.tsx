import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visor — Immigration change intelligence",
  description:
    "Visor tracks embassy and government immigration rule changes and answers your team's questions in one place. Demo build with sample data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
