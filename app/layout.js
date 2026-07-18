import "./globals.css";
import Nav from "./components/Nav";

export const metadata = {
  title: "JustRiff — social writing",
  description: "A social network for words, not pictures. Write your story, riff by riff.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
