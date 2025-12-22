import type { AppDb } from "../db";

const escapeValue = (value: unknown): string => {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export async function exportTableToCsv(
  db: AppDb,
  tableName: keyof AppDb & string
): Promise<{ filename: string; csv: string }> {
  const table = (db as any)[tableName] as { toArray: () => Promise<Record<string, unknown>[]> };
  const rows = await table.toArray();
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeValue(row[header])).join(","));
  });
  return { filename: `${tableName}.csv`, csv: lines.join("\n") };
}

export async function exportAllTables(db: AppDb): Promise<Array<{ filename: string; csv: string }>> {
  const tableNames = [
    "exercises",
    "workouts",
    "workoutEntries",
    "sets",
    "templates",
    "templateEntries",
    "measurements",
    "settings"
  ] as const;
  const results: Array<{ filename: string; csv: string }> = [];
  for (const name of tableNames) {
    results.push(await exportTableToCsv(db, name));
  }
  return results;
}

export function triggerCsvDownload(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
