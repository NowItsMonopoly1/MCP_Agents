import fs from "fs";
import path from "path";

export function loadRegistry(registryPath) {
  const abs = path.resolve(registryPath);
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

export function createProjectAdapter(project) {
  const root = path.resolve(project.root);

  function resolveSafe(rel = "") {
    const abs = path.resolve(root, rel);
    if (!abs.startsWith(root)) throw new Error("ProjectAdapter: path escape blocked");
    return abs;
  }

  function allowed(rel) {
    return project.read.some(p => rel === p || rel.startsWith(p + "/"));
  }

  return {
    meta: project,
    list() {
      return fs.readdirSync(root);
    },
    readFile(rel) {
      if (!allowed(rel)) throw new Error("ProjectAdapter: read not permitted");
      return fs.readFileSync(resolveSafe(rel), "utf8");
    },
    summarize() {
      try {
        const files = fs.readdirSync(root);
        return {
          domain: project.domain,
          status: project.status,
          revenue_ready: project.revenue_ready,
          topLevel: files.slice(0, 25)
        };
      } catch (error) {
        return {
          domain: project.domain,
          status: project.status,
          revenue_ready: project.revenue_ready,
          topLevel: [],
          error: error.message
        };
      }
    }
  };
}