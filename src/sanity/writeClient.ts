import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityConfigured } from "./env";

/** Server-only client with write access, for orders and marking paintings sold. */
export function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!sanityConfigured || !token) return null;
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false });
}
