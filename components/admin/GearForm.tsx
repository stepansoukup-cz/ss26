"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import type { ActionState } from "@/app/admin/actions";
import { deleteGearAction, saveGearAction } from "@/app/admin/gear/actions";
import {
  Field,
  FormMessage,
  SubmitButton,
  TextInput,
  textareaClassName,
} from "@/components/admin/AuthUi";
import {
  AdminCard,
  Button,
  fileInputClassName,
  inputClassName,
  selectClassName,
} from "@/components/admin/AdminUi";
import { AutoGrowTextarea } from "@/components/admin/AutoGrowTextarea";

const initialState: ActionState = {};
const requiredMessage = "Tato položka je povinná.";

type Option = { id: string; name: string };
type ArticleOption = { id: string; title: string };

export type GearFormDefaults = {
  id?: string;
  brand: string;
  model: string;
  categoryId: string;
  note: string;
  boughtAt: string;
  soldAt: string;
  inDrawer: boolean;
  purchaseUrl: string;
  eshopUrl: string;
  listingUrl: string;
  coverImageUrl: string;
  containerId: string;
  sameModelGroupId: string;
  privateInfo: Record<string, string>;
  articleId: string;
};

export function GearForm({
  defaults,
  categories,
  containers,
  groups,
  articles,
  saved = false,
}: {
  defaults: GearFormDefaults;
  categories: Option[];
  containers: Option[];
  groups: Option[];
  articles: ArticleOption[];
  saved?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveGearAction, initialState);
  const [categoryId, setCategoryId] = useState(defaults.categoryId);
  const [groupId, setGroupId] = useState(defaults.sameModelGroupId);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(defaults.id);

  function fieldClassName(name: string, baseClassName = inputClassName) {
    return `${baseClassName} ${
      fieldErrors[name] ? "border-admin-danger focus:border-admin-danger focus:ring-admin-danger/20" : ""
    }`;
  }

  function FieldError({ name }: { name: string }) {
    const message = fieldErrors[name];
    if (!message) {
      return null;
    }
    return <p className="text-xs font-medium text-admin-danger">{message}</p>;
  }

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: Record<string, string> = {};

    function requireField(name: string, message = requiredMessage) {
      const value = formData.get(name);
      if (typeof value !== "string" || !value.trim()) {
        nextErrors[name] = message;
      }
    }

    function validateUrl(name: string) {
      const value = formData.get(name);
      if (typeof value === "string" && value.trim() && !/^https?:\/\/.+/i.test(value.trim())) {
        nextErrors[name] = "URL musí začínat http:// nebo https://.";
      }
    }

    requireField("brand", "Vyplň značku.");
    requireField("model", "Vyplň model.");
    requireField("categoryId", "Vyber kategorii.");

    if (formData.get("categoryId") === "__new") {
      requireField("newCategoryName", "Vyplň název nové kategorie.");
    }
    if (formData.get("sameModelGroupId") === "__new") {
      requireField("newGroupName", "Vyplň název nové skupiny.");
    }

    [
      "purchaseUrl",
      "eshopUrl",
      "listingUrl",
      "coverImageUrl",
      "sellerFb",
      "buyerFb",
    ].forEach(validateUrl);

    setFieldErrors(nextErrors);

    const firstErrorName = Object.keys(nextErrors)[0];
    if (firstErrorName) {
      event.preventDefault();
      const field = form.elements.namedItem(firstErrorName);
      if (field instanceof HTMLElement) {
        field.focus();
        field.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  return (
    <div className="space-y-6">
      {saved ? (
        <div className="rounded-admin-lg border border-admin-success-border bg-admin-success-muted px-admin-4 py-admin-3 text-admin-success">
          Gear byl uložen.{" "}
          {defaults.id ? (
            <Link href={`/gear/${defaults.id}`} className="font-medium underline">
              Zobrazit na webu
            </Link>
          ) : null}
        </div>
      ) : null}

      <form
        action={formAction}
        className="space-y-6"
        noValidate
        onSubmit={validateBeforeSubmit}
        onInput={(event) => {
          const target = event.target;
          if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLSelectElement ||
            target instanceof HTMLTextAreaElement
          ) {
            const name = target.name;
            if (name && fieldErrors[name]) {
              setFieldErrors((current) => {
                const next = { ...current };
                delete next[name];
                return next;
              });
            }
          }
        }}
      >
        {defaults.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

        <AdminCard title="Veřejné údaje">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Značka" htmlFor="brand">
              <TextInput id="brand" name="brand" defaultValue={defaults.brand} className={fieldClassName("brand", "")} aria-invalid={Boolean(fieldErrors.brand)} />
              <FieldError name="brand" />
            </Field>
            <Field label="Model" htmlFor="model">
              <TextInput id="model" name="model" defaultValue={defaults.model} className={fieldClassName("model", "")} aria-invalid={Boolean(fieldErrors.model)} />
              <FieldError name="model" />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Kategorie" htmlFor="categoryId">
              <select
                id="categoryId"
                name="categoryId"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={fieldClassName("categoryId", selectClassName)}
                aria-invalid={Boolean(fieldErrors.categoryId)}
              >
                <option value="">Vyber kategorii</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="__new">+ nová kategorie</option>
              </select>
              <FieldError name="categoryId" />
            </Field>
            {categoryId === "__new" ? (
              <Field label="Název nové kategorie" htmlFor="newCategoryName">
                <TextInput id="newCategoryName" name="newCategoryName" className={fieldClassName("newCategoryName", "")} aria-invalid={Boolean(fieldErrors.newCategoryName)} />
                <FieldError name="newCategoryName" />
              </Field>
            ) : null}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Koupeno" htmlFor="boughtAt">
              <TextInput id="boughtAt" name="boughtAt" type="date" defaultValue={defaults.boughtAt} />
            </Field>
            <Field label="Prodáno" htmlFor="soldAt">
              <TextInput id="soldAt" name="soldAt" type="date" defaultValue={defaults.soldAt} />
            </Field>
          </div>

          <label className="mt-5 flex items-center gap-3 text-sm text-admin-text">
            <input
              type="checkbox"
              name="inDrawer"
              value="1"
              defaultChecked={defaults.inDrawer}
              className="h-4 w-4 rounded border-admin-border bg-admin-bg"
            />
            Šuplík / doma, nehraje koncerty
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="URL nákupu / info" htmlFor="purchaseUrl">
              <TextInput id="purchaseUrl" name="purchaseUrl" type="url" defaultValue={defaults.purchaseUrl} className={fieldClassName("purchaseUrl", "")} aria-invalid={Boolean(fieldErrors.purchaseUrl)} />
              <FieldError name="purchaseUrl" />
            </Field>
            <Field label="E-shop URL" htmlFor="eshopUrl">
              <TextInput id="eshopUrl" name="eshopUrl" type="url" defaultValue={defaults.eshopUrl} className={fieldClassName("eshopUrl", "")} aria-invalid={Boolean(fieldErrors.eshopUrl)} />
              <FieldError name="eshopUrl" />
            </Field>
          </div>
          <Field label="URL inzerátu (pokud je gear na prodej)" htmlFor="listingUrl">
            <TextInput
              id="listingUrl"
              name="listingUrl"
              type="url"
              defaultValue={defaults.listingUrl}
              className={fieldClassName("listingUrl", "")}
              aria-invalid={Boolean(fieldErrors.listingUrl)}
              placeholder="https://..."
            />
            <FieldError name="listingUrl" />
            <p className="text-xs text-admin-faint">
              Jakmile vyplníš datum prodeje, tento odkaz se při uložení automaticky smaže.
            </p>
          </Field>

          <Field label="Poznámka" htmlFor="note">
            <AutoGrowTextarea
              id="note"
              name="note"
              defaultValue={defaults.note}
              rows={4}
              className={`${textareaClassName} mt-2 block min-h-28 resize-none overflow-hidden py-2.5 leading-relaxed`}
            />
          </Field>
        </AdminCard>

        <AdminCard title="Vztahy">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Součást kontejneru / pedalboardu" htmlFor="containerId">
              <select id="containerId" name="containerId" defaultValue={defaults.containerId} className={selectClassName}>
                <option value="">Samostatný kus</option>
                {containers.map((gear) => (
                  <option key={gear.id} value={gear.id}>
                    {gear.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Skupina stejných kusů" htmlFor="sameModelGroupId">
              <select
                id="sameModelGroupId"
                name="sameModelGroupId"
                value={groupId}
                onChange={(event) => setGroupId(event.target.value)}
                className={selectClassName}
              >
                <option value="">Bez skupiny</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
                <option value="__new">+ nová skupina</option>
              </select>
            </Field>
          </div>
          {groupId === "__new" ? (
            <Field label="Název nové skupiny" htmlFor="newGroupName">
              <TextInput id="newGroupName" name="newGroupName" className={fieldClassName("newGroupName", "")} aria-invalid={Boolean(fieldErrors.newGroupName)} />
              <FieldError name="newGroupName" />
            </Field>
          ) : null}
        </AdminCard>

        <AdminCard title="Cover obrázek">
          <div className="space-y-5">
            <Field label="URL cover obrázku" htmlFor="coverImageUrl">
              <TextInput id="coverImageUrl" name="coverImageUrl" type="url" defaultValue={defaults.coverImageUrl} className={fieldClassName("coverImageUrl", "")} aria-invalid={Boolean(fieldErrors.coverImageUrl)} />
              <FieldError name="coverImageUrl" />
            </Field>
            <Field label="Nebo nahraj cover" htmlFor="coverFile">
              <input id="coverFile" name="coverFile" type="file" accept="image/jpeg,image/png,image/webp" className={fileInputClassName} />
            </Field>
            {defaults.coverImageUrl ? (
              <label className="flex items-center gap-3 text-sm text-admin-text">
                <input type="checkbox" name="removeCover" value="1" />
                Odstranit aktuální cover
              </label>
            ) : null}
          </div>
        </AdminCard>

        <AdminCard
          title="Prolink na recenzi / článek"
          description="Každý gear může mít přiřazený maximálně jeden blog článek."
        >
          <ArticleCombobox articles={articles} defaultArticleId={defaults.articleId} />
        </AdminCard>

        <AdminCard title="Soukromé údaje" description="Admin-only. Veřejné stránky tuto tabulku vůbec nečtou.">
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["serial", "Sériové číslo"],
              ["purchasePrice", "Nákupní cena"],
              ["sellPrice", "Prodejní cena"],
              ["sellerName", "Prodejce - jméno"],
              ["sellerPhone", "Prodejce - telefon"],
              ["sellerEmail", "Prodejce - e-mail"],
              ["sellerCity", "Prodejce - město"],
              ["sellerFb", "Prodejce - Facebook"],
              ["buyerName", "Kupující - jméno"],
              ["buyerPhone", "Kupující - telefon"],
              ["buyerEmail", "Kupující - e-mail"],
              ["buyerAddress", "Kupující - adresa"],
              ["buyerFb", "Kupující - Facebook"],
            ].map(([name, label]) => (
              <Field key={name} label={label} htmlFor={name}>
                <input
                  id={name}
                  name={name}
                  defaultValue={defaults.privateInfo[name] ?? ""}
                  className={fieldClassName(name)}
                  aria-invalid={Boolean(fieldErrors[name])}
                />
                <FieldError name={name} />
              </Field>
            ))}
          </div>
        </AdminCard>

        <FormMessage state={state} />
        <SubmitButton className="w-auto px-6">
          {pending ? "Ukládám…" : "Uložit gear"}
        </SubmitButton>
      </form>

      {isEdit && defaults.id ? (
        <AdminCard title="Smazání">
          <form action={deleteGearAction}>
            <input type="hidden" name="id" value={defaults.id} />
            <Button
              type="submit"
              variant="dangerOutline"
              onClick={(event) => {
                if (!window.confirm("Opravdu smazat gear? Obsah kontejneru se nesmaže, jen se odpojí.")) {
                  event.preventDefault();
                }
              }}
            >
              Smazat gear
            </Button>
          </form>
        </AdminCard>
      ) : null}
    </div>
  );
}

function ArticleCombobox({
  articles,
  defaultArticleId,
}: {
  articles: ArticleOption[];
  defaultArticleId: string;
}) {
  const defaultArticle = articles.find((article) => article.id === defaultArticleId);
  const [articleId, setArticleId] = useState(defaultArticle?.id ?? "");
  const [query, setQuery] = useState(defaultArticle?.title ?? "");
  const [open, setOpen] = useState(false);

  const results = articles
    .filter((article) =>
      article.title.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .slice(0, 12);

  return (
    <div className="relative space-y-2">
      <input type="hidden" name="articleId" value={articleId} />
      <Field label="Vyhledat článek" htmlFor="articleSearch">
        <TextInput
          id="articleSearch"
          value={query}
          placeholder="Začni psát název článku…"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setArticleId("");
            setOpen(true);
          }}
        />
      </Field>
      {open && query.trim() ? (
        <div className="absolute z-20 max-h-72 w-full overflow-y-auto rounded-admin-lg border border-admin-border bg-admin-surface shadow-admin-md">
          {results.length ? (
            results.map((article) => (
              <button
                key={article.id}
                type="button"
                className="block w-full px-4 py-3 text-left text-sm text-admin-text transition hover:bg-admin-surface-muted"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setArticleId(article.id);
                  setQuery(article.title);
                  setOpen(false);
                }}
              >
                {article.title}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-admin-muted">
              Nic nenalezeno.
            </p>
          )}
        </div>
      ) : null}
      {articleId ? (
        <button
          type="button"
          className="text-sm font-medium text-admin-muted transition hover:text-admin-text"
          onClick={() => {
            setArticleId("");
            setQuery("");
          }}
        >
          Odebrat přiřazený článek
        </button>
      ) : (
        <p className="text-xs text-admin-faint">
          Pokud nevybereš položku z našeptávače, žádný článek se nepřiřadí.
        </p>
      )}
    </div>
  );
}
