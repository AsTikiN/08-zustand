import type { Metadata } from "next";
import NoteForm from "@/components/NoteForm/NoteForm";
import { getSiteUrl } from "@/lib/siteUrl";
import css from "./CreateNote.module.css";

const title = "Create note — NoteHub";
const description =
  "Create a new personal note in NoteHub. Your draft stays saved until the note is created.";
const url = `${getSiteUrl()}/notes/action/create`;
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
        alt: "Create a note in NoteHub",
      },
    ],
  },
};

export default function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  );
}
