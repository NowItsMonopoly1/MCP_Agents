import fs from "fs";
import path from "path";

const JOURNAL_PATH = path.resolve(process.cwd(), "journal/primus.log.jsonl");

export function writeJournal(entry) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    ...entry
  }) + "\n";
  fs.appendFileSync(JOURNAL_PATH, line, "utf8");
}