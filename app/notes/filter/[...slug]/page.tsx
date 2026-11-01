import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchNotes } from "@/lib/api";
import { getSiteUrl } from "@/lib/siteUrl";
import { isNoteTag, type NoteTag } from "@/types/note";
import NotesClient from "./Notes.client";

const PER_PAGE = 12;
const ogImage = "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg";

interface FilteredNotesPageProps {
  params: Promise<{ slug: string[] }>;
}

function resolveFilter(slug: string[]): "all" | NoteTag | null {
  const filter = slug[0];

  if (!filter || slug.length !== 1) {
    return null;
  }

  if (filter === "all") {
    return "all";
  }

  return isNoteTag(filter) ? filter : null;
}

export async function generateMetadata({
  params,
}: FilteredNotesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const filter = resolveFilter(slug);

  if (!filter) {
    notFound();
  }

  const label = filter === "all" ? "All notes" : filter;
  const title = `${label} — NoteHub`;
  const description = `Browse personal notes in NoteHub. Selected filter: ${label}.`;
  const url = `${getSiteUrl()}/notes/filter/${filter}`;

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
          alt: title,
        },
      ],
    },
  };
}

export default async function FilteredNotesPage({
  params,
}: FilteredNotesPageProps) {
  const { slug } = await params;
  const filter = resolveFilter(slug);

  if (!filter) {
    notFound();
  }

  const tag: NoteTag | undefined = filter === "all" ? undefined : filter;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", 1, "", tag ?? "all"],
    queryFn: () => fetchNotes({ page: 1, perPage: PER_PAGE, search: "", tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={filter} tag={tag} />
    </HydrationBoundary>
  );
}
