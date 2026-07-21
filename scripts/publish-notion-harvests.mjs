import { readFile, writeFile } from "node:fs/promises";

const storePath = process.env.OCTOPUS_WAKE_STORE ?? ".octopus/wakes.json";
const token = process.env.NOTION_API_KEY ?? process.env.NOTION_TOKEN ?? process.env.NOTION_API_TOKEN;
const parentPageId = process.env.NOTION_PAGE_ID;

if (!token) throw new Error("Missing NOTION_API_KEY repository secret.");
if (!parentPageId) throw new Error("Missing NOTION_PAGE_ID repository secret.");

const text = (value) => typeof value === "string" ? value.trim() : "";
const record = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};

function artifactFrom(wake) {
  const result = record(wake.lastResult);
  const output = record(result.output);
  const artifacts = Array.isArray(output.artifacts) ? output.artifacts.map(record) : [];
  const artifact = artifacts.find((item) => text(item.content) || text(item.artifact)) ?? record(result.artifact);
  return {
    title: text(artifact.title) || text(wake.mission?.title) || "Récolte de Gérard",
    content: text(artifact.content) || text(artifact.artifact) || text(output.text) || text(result.content),
  };
}

function paragraph(content) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: [{ type: "text", text: { content } }] },
  };
}

function blocksFor(wake, content) {
  const parcelId = text(wake.mission?.context?.metadata?.parcelId) || text(wake.mission?.context?.id) || "poulpe-fiction";
  const operationId = text(wake.mission?.operationId) || text(wake.lastResult?.operationId) || text(wake.id);
  const chunks = content.match(/[\s\S]{1,1800}/g) ?? [];
  return [
    paragraph(`Parcelle : ${parcelId}`),
    paragraph(`Mission : ${operationId}`),
    paragraph(`Générée le : ${wake.lastCompletedAt || new Date().toISOString()}`),
    ...chunks.slice(0, 90).map(paragraph),
  ];
}

async function createNotionPage(wake, artifact) {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      icon: { type: "emoji", emoji: "🌾" },
      properties: {
        title: { title: [{ type: "text", text: { content: artifact.title.slice(0, 180) } }] },
      },
      children: blocksFor(wake, artifact.content),
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Notion page creation failed (${response.status}): ${text(payload.message) || "unknown error"}`);
  }
  return payload;
}

const snapshot = JSON.parse(await readFile(storePath, "utf8"));
if (!Array.isArray(snapshot.wakes)) throw new Error("Wake store is invalid.");

let published = 0;
for (const wake of snapshot.wakes) {
  if (wake.status !== "completed" || !wake.lastResult) continue;
  const existing = text(wake.lastResult.notionUrl) || text(wake.lastResult.editorialSource?.url);
  if (existing) continue;
  const artifact = artifactFrom(wake);
  if (!artifact.content) continue;

  const page = await createNotionPage(wake, artifact);
  const syncedAt = new Date().toISOString();
  wake.lastResult = {
    ...wake.lastResult,
    notionPageId: page.id,
    notionUrl: page.url,
    editorialSource: {
      provider: "notion",
      pageId: page.id,
      url: page.url,
      parentPageId,
      status: "review",
      lastSyncedAt: syncedAt,
    },
  };
  published += 1;
}

await writeFile(storePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ published, storePath }));
