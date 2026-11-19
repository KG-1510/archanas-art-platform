"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "archanas-art",
  title: "Archana's Art",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    // Orders are created by the website and there is only one Site settings document,
    // so neither is offered in the "create new" menu.
    newDocumentOptions: (prev) => prev.filter((item) => !["order", "siteSettings"].includes(item.templateId)),
  },
});
