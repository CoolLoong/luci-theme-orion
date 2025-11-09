#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function removeAllChildren(targetDir) {
  if (!fs.existsSync(targetDir)) return;
  for (const item of fs.readdirSync(targetDir)) {
    const itemPath = path.join(targetDir, item);
    fs.rmSync(itemPath, { recursive: true, force: true });
  }
}

function cleanBuildOutput() {
  const projectRoot = process.cwd();
  const htdocsDir = path.join(projectRoot, "htdocs");

  console.log("🧹 Cleaning build output...");

  if (fs.existsSync(htdocsDir)) {
    console.log(`   Removing: ${htdocsDir}`);
    fs.rmSync(htdocsDir, { recursive: true, force: true });
  }

  console.log("✅ Clean completed!");
}

cleanBuildOutput();
