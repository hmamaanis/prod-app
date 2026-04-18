import './globals.css';

export const metadata = {
  title: 'PROD — Production Coordination',
  description: 'AI-powered film production management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
