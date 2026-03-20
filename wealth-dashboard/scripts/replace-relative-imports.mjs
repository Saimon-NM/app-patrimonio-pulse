import fs from 'fs';
import path from 'path';

const SRC_ROOT = path.resolve(process.cwd(), 'src');

const fileExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (fileExtensions.has(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
};

const tryResolveToFile = (importerDir, spec) => {
  const resolved = path.resolve(importerDir, spec);
  const candidates = [
    `${resolved}.ts`,
    `${resolved}.tsx`,
    `${resolved}.d.ts`,
    `${resolved}.js`,
    `${resolved}.jsx`,
    path.join(resolved, 'index.ts'),
    path.join(resolved, 'index.tsx'),
    path.join(resolved, 'index.d.ts'),
    path.join(resolved, 'index.js'),
    path.join(resolved, 'index.jsx'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  // Último recurso: aceptar la ruta “base” (sin ext) tal como venía.
  return resolved;
};

const toAliasTarget = (srcRoot, absoluteFilePath) => {
  const rel = path.relative(srcRoot, absoluteFilePath);
  const withoutExt = rel.replace(/\.(ts|tsx|js|jsx|d\.ts)$/g, '');
  return `@/${withoutExt.split(path.sep).join('/')}`;
};

const updateImportsInFile = (filePath) => {
  const src = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const importerDir = path.dirname(filePath);

  // static: import ... from '../../...'
  const fromRe = /from\s+(['"])(\.\.\/[^'"]+)\1/g;
  const dynamicRe = /import\s*\(\s*(['"])(\.\.\/[^'"]+)\1\s*\)/g;

  const computeReplacement = (spec) => {
    const resolvedFile = tryResolveToFile(importerDir, spec);
    const aliasTarget = toAliasTarget(SRC_ROOT, resolvedFile);
    return aliasTarget;
  };

  const nextFrom = src.replace(fromRe, (match, quote, spec) => {
    // Convertimos solo "../..." (no "./...") para evitar ruido.
    if (!spec.startsWith('../')) return match;
    const aliasTarget = computeReplacement(spec);
    changed = true;
    return `from ${quote}${aliasTarget}${quote}`;
  });

  const next = nextFrom.replace(dynamicRe, (match, quote, spec) => {
    if (!spec.startsWith('../')) return match;
    const aliasTarget = computeReplacement(spec);
    changed = true;
    return `import(${quote}${aliasTarget}${quote})`;
  });

  if (!changed) return false;
  fs.writeFileSync(filePath, next, 'utf8');
  return true;
};

const main = () => {
  if (!fs.existsSync(SRC_ROOT)) {
    console.error(`SRC_ROOT not found: ${SRC_ROOT}`);
    process.exit(1);
  }

  const files = walk(SRC_ROOT);
  let updated = 0;

  for (const filePath of files) {
    if (updateImportsInFile(filePath)) updated += 1;
  }

  console.log(`Updated ${updated} files`);
};

main();

