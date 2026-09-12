import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);

    const basePath = resolve(process.cwd(), specifier.slice(2));
    const candidate = [basePath, `${basePath}.ts`, `${basePath}.tsx`].find(existsSync);
    if (!candidate) return nextResolve(specifier, context);
    return nextResolve(pathToFileURL(candidate).href, context);
  },
});
