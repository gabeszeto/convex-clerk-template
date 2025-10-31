import { Providers } from "./providers";
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
