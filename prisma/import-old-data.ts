import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), "prisma", "migration-data");
const SAMPLE_LIMIT = 40;
const LINK_BATCH_SIZE = 500;
const FREE_CATEGORY_OLD_ID = "13";
const FREE_CATEGORY_NAME = "volná kategorie";

type CsvRow = Record<string, string | undefined>;

const oldCategoryToNew = new Map<string, string | null>();
const oldBandToNew = new Map<string, string>();
const oldGearToNew = new Map<string, string>();
const oldGigToNew = new Map<string, string>();

const stats = {
  categoriesMapped: 0,
  categoriesWithoutTarget: 0,
  bandsImported: 0,
  bandsSkipped: 0,
  gearImported: 0,
  gearSkipped: 0,
  gearPrivateInfoImported: 0,
  gearContainerUpdated: 0,
  gigsImported: 0,
  gigsSkipped: 0,
  linksImported: 0,
  linksSkipped: 0,
};

const skipped = new Map<string, number>();
const samples: string[] = [];

function addSkip(reason: string, detail: string) {
  skipped.set(reason, (skipped.get(reason) ?? 0) + 1);
  if (samples.length < SAMPLE_LIMIT) {
    samples.push(`${reason}: ${detail}`);
  }
}

function clean(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function key(value: string): string {
  return value.trim().toLowerCase();
}

function get(row: CsvRow, column: string): string | null {
  return clean(row[column]);
}

function getAny(row: CsvRow, columns: string[]): string | null {
  const normalized = new Map(
    Object.entries(row).map(([column, value]) => [column.toLowerCase(), value]),
  );

  for (const column of columns) {
    const value = clean(normalized.get(column.toLowerCase()));
    if (value) {
      return value;
    }
  }

  return null;
}

function detectDelimiter(source: string): "," | ";" {
  const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

function readCsv(fileName: string): CsvRow[] {
  const filePath = path.join(DATA_DIR, fileName);
  const source = readFileSync(filePath, "utf8");

  return parse(source, {
    bom: true,
    columns: (headers: string[]) => headers.map((header) => header.trim()),
    delimiter: detectDelimiter(source),
    relax_column_count: true,
    relax_quotes: true,
    skip_empty_lines: true,
    trim: true,
  });
}

function parseCzechDate(
  value: string | null,
  context: { file: string; rowId: string; field: string; required?: boolean },
): Date | null {
  if (!value || value === "0000-00-00" || value.startsWith("0000-00-00 ")) {
    if (context.required) {
      addSkip(
        `${context.file}.${context.field}.missing`,
        `old_id=${context.rowId}`,
      );
    }
    return null;
  }

  const czechMatch = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+\d{1,2}:\d{2}:\d{2})?$/);

  let day: number;
  let month: number;
  let year: number;

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (czechMatch) {
    day = Number(czechMatch[1]);
    month = Number(czechMatch[2]);
    year = Number(czechMatch[3]);
  } else {
    addSkip(
      `${context.file}.${context.field}.invalid`,
      `old_id=${context.rowId}, value=${value}`,
    );
    return null;
  }

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    year < 1000 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    addSkip(
      `${context.file}.${context.field}.invalid`,
      `old_id=${context.rowId}, value=${value}`,
    );
    return null;
  }

  // Datum parsujeme ručně a ukládáme v poledne UTC, aby se v UI neposunulo o den kvůli časové zóně.
  const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    addSkip(
      `${context.file}.${context.field}.invalid`,
      `old_id=${context.rowId}, value=${value}`,
    );
    return null;
  }

  return parsed;
}

function parseBool01(value: string | null): boolean {
  return value === "1";
}

function parseMoney(
  value: string | null,
  context: { rowId: string; field: string },
): string | null {
  if (!value) {
    return null;
  }

  let normalized = value.replace(/\s+/g, "").replace(/[^\d,.-]/g, "");
  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  }

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    addSkip(
      `gear.${context.field}.invalid_money`,
      `old_id=${context.rowId}, value=${value}`,
    );
    return null;
  }

  return normalized;
}

async function clearTargetTables() {
  const confirmed =
    process.env.CONFIRM === "yes" || process.argv.includes("--confirm");

  if (!confirmed) {
    throw new Error(
      [
        "Import je destruktivní: smaže GearOnGig, GearPrivateInfo, ArticleGear, Gig, Band a Gear.",
        "Categories nemaže.",
        "Spusť znovu s CONFIRM=yes nebo parametrem --confirm.",
      ].join("\n"),
    );
  }

  console.warn(
    "VAROVÁNÍ: mažu cílové tabulky importu (Categories zůstávají beze změny).",
  );

  await prisma.$transaction([
    prisma.gearOnGig.deleteMany(),
    prisma.gearPrivateInfo.deleteMany(),
    prisma.articleGear.deleteMany(),
    prisma.gig.deleteMany(),
    prisma.band.deleteMany(),
    prisma.gear.deleteMany(),
  ]);
}

async function mapCategories() {
  const categoryRows = readCsv("categories.csv");
  const existingCategories = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  const existingByName = new Map(
    existingCategories.map((category) => [key(category.name), category.id]),
  );

  for (const row of categoryRows) {
    const oldId = get(row, "id");
    const name = get(row, "name");
    if (!oldId || !name) {
      addSkip("categories.missing_id_or_name", JSON.stringify(row));
      continue;
    }

    if (oldId === FREE_CATEGORY_OLD_ID || key(name) === FREE_CATEGORY_NAME) {
      oldCategoryToNew.set(oldId, null);
      continue;
    }

    const newId = existingByName.get(key(name));
    if (!newId) {
      oldCategoryToNew.set(oldId, null);
      stats.categoriesWithoutTarget += 1;
      addSkip("categories.no_target_category", `old_id=${oldId}, name=${name}`);
      continue;
    }

    oldCategoryToNew.set(oldId, newId);
    stats.categoriesMapped += 1;
  }
}

async function importBands() {
  const rows = readCsv("bands.csv");
  const byName = new Map<string, string>();

  for (const row of rows) {
    const oldId = get(row, "id");
    const name = get(row, "name");
    if (!oldId || !name) {
      stats.bandsSkipped += 1;
      addSkip("bands.missing_id_or_name", JSON.stringify(row));
      continue;
    }

    const existingId = byName.get(key(name));
    if (existingId) {
      oldBandToNew.set(oldId, existingId);
      continue;
    }

    const band = await prisma.band.create({ data: { name } });
    byName.set(key(name), band.id);
    oldBandToNew.set(oldId, band.id);
    stats.bandsImported += 1;
  }
}

async function importGearFirstPass(rows: CsvRow[]) {
  for (const row of rows) {
    const oldId = get(row, "id");
    const brand = get(row, "brand");
    const model = get(row, "model");

    if (!oldId || !brand || !model) {
      stats.gearSkipped += 1;
      addSkip("gear.missing_required_field", `old_id=${oldId ?? "?"}`);
      continue;
    }

    const oldCategory = get(row, "category");
    const categoryId = oldCategory ? oldCategoryToNew.get(oldCategory) ?? null : null;

    if (oldCategory && !oldCategoryToNew.has(oldCategory)) {
      addSkip("gear.category_not_found_in_categories_csv", `old_id=${oldId}, category=${oldCategory}`);
    }

    const boughtAt = parseCzechDate(get(row, "bought"), {
      file: "gear",
      rowId: oldId,
      field: "bought",
    });
    const soldAt = parseCzechDate(get(row, "sold"), {
      file: "gear",
      rowId: oldId,
      field: "sold",
    });

    const gear = await prisma.gear.create({
      data: {
        brand,
        model,
        categoryId,
        note: get(row, "note"),
        boughtAt,
        soldAt,
        inDrawer: parseBool01(get(row, "suplik")),
        purchaseUrl: get(row, "url"),
        eshopUrl: get(row, "eshop"),
      },
      select: { id: true },
    });

    oldGearToNew.set(oldId, gear.id);
    stats.gearImported += 1;

    await prisma.gearPrivateInfo.create({
      data: {
        gearId: gear.id,
        serial: get(row, "serial"),
        purchasePrice: parseMoney(get(row, "price"), {
          rowId: oldId,
          field: "price",
        }),
        sellPrice: parseMoney(get(row, "sell_price"), {
          rowId: oldId,
          field: "sell_price",
        }),
        sellerName: get(row, "seller_name"),
        sellerPhone: get(row, "seller_phone"),
        sellerEmail: get(row, "seller_email"),
        sellerCity: get(row, "seller_city"),
        sellerFb: get(row, "seller_fb"),
        buyerName: get(row, "buyer_name"),
        buyerPhone: get(row, "buyer_phone"),
        buyerEmail: get(row, "buyer_email"),
        buyerAddress: get(row, "buyer_adress"),
        buyerFb: get(row, "buyer_fb"),
      },
    });
    stats.gearPrivateInfoImported += 1;
  }
}

async function importGearContainers(rows: CsvRow[]) {
  for (const row of rows) {
    const oldId = get(row, "id");
    const parentId = get(row, "parent_id");

    if (!oldId || !parentId || parentId === "0") {
      continue;
    }

    const gearId = oldGearToNew.get(oldId);
    const containerId = oldGearToNew.get(parentId);

    if (!gearId || !containerId) {
      addSkip(
        "gear.parent_missing_mapping",
        `old_id=${oldId}, parent_id=${parentId}`,
      );
      continue;
    }

    await prisma.gear.update({
      where: { id: gearId },
      data: { containerId },
    });
    stats.gearContainerUpdated += 1;
  }
}

async function importGear() {
  const rows = readCsv("gear.csv");
  await importGearFirstPass(rows);
  await importGearContainers(rows);
}

async function importGigs() {
  const rows = readCsv("gigs.csv");

  for (const row of rows) {
    const oldId = get(row, "id");
    const date = parseCzechDate(get(row, "date"), {
      file: "gigs",
      rowId: oldId ?? "?",
      field: "date",
      required: true,
    });

    if (!oldId || !date) {
      stats.gigsSkipped += 1;
      addSkip("gigs.missing_id_or_date", `old_id=${oldId ?? "?"}`);
      continue;
    }

    const oldBandId = get(row, "band_id");
    const bandId = oldBandId ? oldBandToNew.get(oldBandId) : undefined;
    if (!bandId) {
      stats.gigsSkipped += 1;
      addSkip("gigs.missing_band_mapping", `old_id=${oldId}, band_id=${oldBandId ?? "null"}`);
      continue;
    }

    const city = get(row, "city");
    if (!city) {
      stats.gigsSkipped += 1;
      addSkip("gigs.missing_city", `old_id=${oldId}`);
      continue;
    }

    const gig = await prisma.gig.create({
      data: {
        date,
        city,
        place: get(row, "place"),
        name: get(row, "name"),
        note: get(row, "note"),
        photosUrl: get(row, "photos_url"),
        recordingUrl: get(row, "recording_url"),
        youtubeUrl: get(row, "video_url"),
        bandId,
      },
      select: { id: true },
    });

    oldGigToNew.set(oldId, gig.id);
    stats.gigsImported += 1;
  }
}

async function importGearOnGigs() {
  const rows = readCsv("gearOnGigs.csv");
  const rowsToCreate: { gearId: string; gigId: string }[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const oldGearId = getAny(row, ["gear_id", "gearId", "gear"]);
    const oldGigId = getAny(row, ["gig_id", "gigId", "gig"]);
    const gearId = oldGearId ? oldGearToNew.get(oldGearId) : undefined;
    const gigId = oldGigId ? oldGigToNew.get(oldGigId) : undefined;

    if (!gearId || !gigId) {
      stats.linksSkipped += 1;
      addSkip(
        "gearOnGigs.missing_mapping",
        `gear_id=${oldGearId ?? "null"}, gig_id=${oldGigId ?? "null"}`,
      );
      continue;
    }

    const composite = `${gearId}:${gigId}`;
    if (seen.has(composite)) {
      continue;
    }

    seen.add(composite);
    rowsToCreate.push({ gearId, gigId });
  }

  for (let index = 0; index < rowsToCreate.length; index += LINK_BATCH_SIZE) {
    const batch = rowsToCreate.slice(index, index + LINK_BATCH_SIZE);
    const result = await prisma.gearOnGig.createMany({
      data: batch,
      skipDuplicates: true,
    });
    stats.linksImported += result.count;
  }
}

function printSummary() {
  console.log("\nImport dokončen.");
  console.table({
    "Kategorie namapováno": stats.categoriesMapped,
    "Kategorie bez protějšku": stats.categoriesWithoutTarget,
    "Kapely importováno": stats.bandsImported,
    "Kapely přeskočeno": stats.bandsSkipped,
    "Gear importováno": stats.gearImported,
    "Gear přeskočeno": stats.gearSkipped,
    "GearPrivateInfo importováno": stats.gearPrivateInfoImported,
    "Container vazby nastaveno": stats.gearContainerUpdated,
    "Koncerty importováno": stats.gigsImported,
    "Koncerty přeskočeno": stats.gigsSkipped,
    "GearOnGig vazby importováno": stats.linksImported,
    "GearOnGig vazby přeskočeno": stats.linksSkipped,
  });

  if (skipped.size > 0) {
    console.log("\nPřeskočeno / upraveno podle důvodu:");
    for (const [reason, count] of skipped) {
      console.log(`- ${reason}: ${count}`);
    }
  }

  if (samples.length > 0) {
    console.log("\nUkázky varování:");
    for (const sample of samples) {
      console.log(`- ${sample}`);
    }
  }
}

async function main() {
  await clearTargetTables();
  await mapCategories();
  await importBands();
  await importGear();
  await importGigs();
  await importGearOnGigs();
  printSummary();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
