import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function tryResolveTsFile(candidatePath) {
  const candidates = [
    candidatePath,
    `${candidatePath}.ts`,
    `${candidatePath}.tsx`,
    path.join(candidatePath, "index.ts"),
    path.join(candidatePath, "index.tsx")
  ];

  for (const item of candidates) {
    if (fs.existsSync(item) && fs.statSync(item).isFile()) {
      return pathToFileURL(item).href;
    }
  }

  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = tryResolveTsFile(path.join(repoRoot, specifier.slice(2)));

    if (resolved) {
      return {
        url: resolved,
        shortCircuit: true
      };
    }
  }

  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
    const parentPath = path.dirname(fileURLToPath(context.parentURL));
    const resolved = tryResolveTsFile(path.resolve(parentPath, specifier));

    if (resolved) {
      return {
        url: resolved,
        shortCircuit: true
      };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
