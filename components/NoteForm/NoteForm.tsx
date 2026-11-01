"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent } from "react";
import { createNote } from "@/lib/api";
import { initialDraft, useNoteStore } from "@/lib/store/noteStore";
import { isNoteTag, NOTE_TAGS, type NewNote, type NoteTag } from "@/types/note";
import css from "./NoteForm.module.css";

type NoteErrors = Partial<Record<keyof NewNote, string>>;

function validate(values: NewNote): NoteErrors {
  const errors: NoteErrors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required";
  } else if (values.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (values.title.length > 50) {
    errors.title = "Title must be at most 50 characters";
  }

  if (values.content.length > 500) {
    errors.content = "Content must be at most 500 characters";
  }

  if (!isNoteTag(values.tag)) {
    errors.tag = "Tag is required";
  }

  return errors;
}

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useNoteStore((state) => state.draft) ?? initialDraft;
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<NoteErrors>({});

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsubscribe = useNoteStore.persist.onFinishHydration(finish);

    if (useNoteStore.persist.hasHydrated()) {
      finish();
    } else {
      void useNoteStore.persist.rehydrate();
    }

    return unsubscribe;
  }, []);

  const mutation = useMutation({
    mutationFn: createNote,
  });

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    const current = useNoteStore.getState().draft ?? initialDraft;
    setDraft({
      ...current,
      [name]: value,
    });
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
  };

  const formAction = async (formData: FormData) => {
    const tagValue = String(formData.get("tag") ?? initialDraft.tag);
    const tag: NoteTag = isNoteTag(tagValue) ? tagValue : "Todo";
    const values: NewNote = {
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      tag,
    };

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await mutation.mutateAsync(values);
    clearDraft();
    await queryClient.invalidateQueries({ queryKey: ["notes"] });
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (!hydrated) {
    return <p>Loading draft...</p>;
  }

  return (
    <form className={css.form} action={formAction}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          value={draft.title}
          onChange={handleChange}
          minLength={3}
          maxLength={50}
          required
        />
        <span className={css.error}>{errors.title ?? ""}</span>
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          value={draft.content}
          onChange={handleChange}
          maxLength={500}
        />
        <span className={css.error}>{errors.content ?? ""}</span>
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={draft.tag}
          onChange={handleChange}
        >
          {NOTE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <span className={css.error}>{errors.tag ?? ""}</span>
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          formAction={formAction}
          disabled={mutation.isPending}
        >
          Create note
        </button>
      </div>
      {mutation.isError && (
        <p className={css.error}>Could not create the note. Try again.</p>
      )}
    </form>
  );
}
