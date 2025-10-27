import "./globals.css";

export const metadata = {
  title: "Wiki - The Free Encyclopedia",
  description: "A Wikipedia-style wiki application built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
