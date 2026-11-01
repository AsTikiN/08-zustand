import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { fetchNoteById } from "@/lib/api";
import { getSiteUrl } from "@/lib/siteUrl";
import NoteDetailsClient from "./NoteDetails.client";

const ogImage = "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg";

interface NoteDetailsPageProps {
  params: Promise<{ id: string }>;
}

function summarizeNote(title: string, content: string): string {
  const text = content.replace(/\s+/g, " ").trim();
  if (!text) {
    return `Open the note "${title}" in NoteHub.`;
  }

  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

export async function generateMetadata({
  params,
}: NoteDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const url = `${getSiteUrl()}/notes/${id}`;

  try {
    const note = await fetchNoteById(id);
    const title = note.title;
    const description = summarizeNote(note.title, note.content);

    return {
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
            alt: note.title,
          },
        ],
      },
    };
  } catch {
    const title = "Note not found — NoteHub";
    const description = "This note does not exist in NoteHub.";

    return {
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
            alt: "NoteHub",
          },
        ],
      },
    };
  }
}

export default async function NoteDetails({ params }: NoteDetailsPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
