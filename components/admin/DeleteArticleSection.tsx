"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { deleteArticleAction } from "@/app/admin/article-actions";
import { FormMessage } from "@/components/admin/AuthUi";
import {
  Button,
  DangerZone,
  Modal,
} from "@/components/admin/AdminUi";
import { DELETE_ARTICLE_CONFIRMATION_TEXT } from "@/lib/admin/article-delete";

const initialState: ActionState = {};

export function DeleteArticleSection({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [aware, setAware] = useState(false);
  const [state, formAction, pending] = useActionState(
    deleteArticleAction,
    initialState,
  );

  function closeDialog() {
    setOpen(false);
    setAware(false);
  }

  return (
    <>
      <DangerZone
        title="Nebezpečná zóna"
        description={`Smazání článku „${title}“ je trvalé. Z databáze zmizí i všechna související média na Cloudinary.`}
      >
        <Button type="button" variant="dangerOutline" onClick={() => setOpen(true)}>
          Smazat článek
        </Button>
      </DangerZone>

      <Modal
        open={open}
        onClose={closeDialog}
        title="Opravdu smazat článek?"
        description="Tato akce je nenávratná. Článek, komentáře, štítky i soubory na Cloudinary budou odstraněny."
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="articleId" value={articleId} />
          <input
            type="hidden"
            name="confirmation"
            value={aware ? DELETE_ARTICLE_CONFIRMATION_TEXT : ""}
          />

          <label className="flex items-start gap-3 rounded-admin-lg border border-admin-border bg-admin-bg p-4 text-sm leading-relaxed text-admin-text">
            <input
              type="checkbox"
              checked={aware}
              onChange={(event) => setAware(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-admin-border accent-admin-accent"
            />
            <span>{DELETE_ARTICLE_CONFIRMATION_TEXT}</span>
          </label>

          <FormMessage state={state} />

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Zrušit
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!aware || pending}
            >
              {pending ? "Mažu…" : "Trvale smazat"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
