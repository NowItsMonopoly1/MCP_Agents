import fs from "fs";
import path from "path";

const JOURNAL_PATH = path.resolve(process.cwd(), "journal/primus.log.jsonl");

export function tailJournal(lines = 20) {
  if (!fs.existsSync(JOURNAL_PATH)) {
    console.log("No journal entries yet.");
    return;
  }

  const content = fs.readFileSync(JOURNAL_PATH, "utf8")
    .trim()
    .split("\n")
    .slice(-lines);

  for (const line of content) {
    console.log(line);
  }
}