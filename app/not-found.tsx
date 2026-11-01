import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import css from "./Home.module.css";

const title = "Page not found — NoteHub";
const description =
  "Sorry, this page does not exist. The address may be wrong, or the page was removed from NoteHub.";
const url = `${getSiteUrl()}/not-found`;
const ogImage = "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "NoteHub — page not found",
      },
    ],
  },
};

export default function NotFound() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>404 - Page not found</h1>
        <p className={css.description}>
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </main>
  );
}
