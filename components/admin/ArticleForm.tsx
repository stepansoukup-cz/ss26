"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ArticleStatus, CoverType } from "@prisma/client";
import type { ActionState } from "@/app/admin/actions";
import { saveArticleAction } from "@/app/admin/article-actions";
import {
  Field,
  FormMessage,
  SubmitButton,
  TextInput,
  textareaClassName,
} from "@/components/admin/AuthUi";
import { DeleteArticleSection } from "@/components/admin/DeleteArticleSection";
import { ArticleContentEditor } from "@/components/admin/ArticleContentEditor";
import { ReviewScoreSliders } from "@/components/admin/ReviewScoreSliders";
import { TagsInput } from "@/components/admin/TagsInput";
import {
  AdminCard,
  Alert,
  ButtonLink,
  fileInputClassName,
  selectClassName,
} from "@/components/admin/AdminUi";
import { slugifyTitle } from "@/lib/slug";
import { coverImageUploadHint } from "@/lib/image-upload";
import { EMPTY_REVIEW_SCORES } from "@/lib/review-score";
import { validateImageFile } from "@/lib/validations/media";
import type { ArticleFormDefaults } from "@/lib/validations/article";

const initialState: ActionState = {};

const emptyDefaults: Omit<ArticleFormDefaults, "id"> & { id?: string } = {
  title: "",
  slug: "",
  perex: "",
  content: "",
  coverType: CoverType.IMAGE,
  coverImageUrl: "",
  coverVideoUrl: "",
  status: ArticleStatus.DRAFT,
  tags: [],
};

export function ArticleForm({
  article,
  saved = false,
}: {
  article?: ArticleFormDefaults;
  saved?: boolean;
}) {
  const isEdit = Boolean(article?.id);
  const defaults = article ?? emptyDefaults;
  const reviewScores = defaults.reviewScores ?? EMPTY_REVIEW_SCORES;

  const [state, formAction, pending] = useActionState(
    saveArticleAction,
    initialState,
  );
  const [title, setTitle] = useState(defaults.title);
  const [slug, setSlug] = useState(defaults.slug);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [coverType, setCoverType] = useState<CoverType>(defaults.coverType);
  const [coverImageUrl, setCoverImageUrl] = useState(defaults.coverImageUrl);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(
    defaults.coverImageUrl || null,
  );
  const [removeCover, setRemoveCover] = useState(false);
  const [coverFileError, setCoverFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugifyTitle(title));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  function handleCoverFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setCoverFileError(null);

    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setCoverFileError(validationError);
      event.target.value = "";
      return;
    }

    setRemoveCover(false);
    setCoverPreviewUrl((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
  }

  function handleRemoveCover() {
    setRemoveCover(true);
    setCoverImageUrl("");
    setCoverFileError(null);
    setCoverPreviewUrl((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }

  return (
    <div className="space-y-6">
      {saved ? (
        <Alert variant="success">
          Článek byl uložen.
          {isEdit ? (
            <>
              {" "}
              <Link
                href={`/blog/${defaults.slug}`}
                className="font-medium underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                Zobrazit na webu
              </Link>
            </>
          ) : null}
        </Alert>
      ) : null}

      <form action={formAction} className="space-y-6">
        {isEdit ? <input type="hidden" name="id" value={article!.id} /> : null}

        <AdminCard title="Základní údaje">
          <div className="space-y-5">
            <Field label="Titulek">
              <TextInput
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Field>
            <Field label="Slug (URL)">
              <TextInput
                id="slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
            </Field>
            <p className="text-xs text-admin-faint">
              Veřejná adresa: /blog/{slug || "…"}
            </p>
            <Field label="Perex">
              <textarea
                id="perex"
                name="perex"
                rows={3}
                defaultValue={defaults.perex}
                required
                className={textareaClassName}
              />
            </Field>
            <Field label="Obsah">
              <ArticleContentEditor
                name="content"
                defaultValue={defaults.content ?? ""}
                articleId={article?.id}
              />
            </Field>
            <Field label="Štítky">
              <TagsInput name="tags" defaultTags={defaults.tags ?? []} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard
          title="Hodnocení recenze"
          description="Volitelné skóre 0–10. Posuvník na 0 = nehodnoceno (neukládá se)."
        >
          <ReviewScoreSliders defaults={reviewScores} />
        </AdminCard>

        <AdminCard title="Cover (16:9)">
          <div className="space-y-5">
            <Field label="Typ coveru">
              <select
                id="coverType"
                name="coverType"
                value={coverType}
                onChange={(event) =>
                  setCoverType(event.target.value as CoverType)
                }
                className={selectClassName}
              >
                <option value={CoverType.IMAGE}>Obrázek</option>
                <option value={CoverType.VIDEO}>Video</option>
              </select>
            </Field>

            {coverType === CoverType.IMAGE ? (
              <>
                <Field label="URL cover obrázku">
                  <TextInput
                    id="coverImageUrl"
                    name="coverImageUrl"
                    type="url"
                    value={coverImageUrl}
                    onChange={(event) => {
                      setCoverImageUrl(event.target.value);
                      setRemoveCover(false);
                      if (event.target.value) {
                        setCoverPreviewUrl(event.target.value);
                      }
                    }}
                    placeholder="https://…"
                  />
                </Field>
                <Field label="Nebo nahraj obrázek">
                  <input
                    type="file"
                    name="coverFile"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={fileInputClassName}
                    onChange={handleCoverFileChange}
                  />
                  <p className="mt-2 text-xs text-admin-faint">
                    {coverImageUploadHint()}
                  </p>
                </Field>
                {coverFileError ? (
                  <Alert variant="error">{coverFileError}</Alert>
                ) : null}
                {removeCover ? (
                  <input type="hidden" name="removeCover" value="1" />
                ) : null}
                {coverPreviewUrl && !removeCover ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-admin-lg border border-admin-border bg-admin-bg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverPreviewUrl}
                        alt="Náhled coveru"
                        className="aspect-video w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="text-sm text-admin-danger transition hover:text-red-400"
                    >
                      Odstranit cover obrázek
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <Field label="URL videa (soubor, YouTube nebo Vimeo)">
                <TextInput
                  id="coverVideoUrl"
                  name="coverVideoUrl"
                  type="url"
                  defaultValue={defaults.coverVideoUrl}
                  placeholder="https://…"
                />
              </Field>
            )}
          </div>
        </AdminCard>

        <AdminCard title="Publikace">
          <div className="space-y-5">
            <Field label="Status">
              <select
                id="status"
                name="status"
                defaultValue={defaults.status}
                className={selectClassName}
              >
                <option value={ArticleStatus.DRAFT}>Koncept (DRAFT)</option>
                <option value={ArticleStatus.PUBLISHED}>
                  Publikováno (PUBLISHED)
                </option>
              </select>
            </Field>
            <p className="text-sm text-admin-muted">
              Při prvním publikování se automaticky nastaví datum publikace.
            </p>
          </div>
        </AdminCard>

        <FormMessage state={state} />

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton className="w-auto px-6">
            {pending ? "Ukládám…" : isEdit ? "Uložit změny" : "Vytvořit článek"}
          </SubmitButton>
          <ButtonLink href="/admin/clanky" variant="secondary">
            Zrušit
          </ButtonLink>
        </div>
      </form>

      {isEdit && article?.id ? (
        <DeleteArticleSection articleId={article.id} title={defaults.title} />
      ) : null}
    </div>
  );
}
