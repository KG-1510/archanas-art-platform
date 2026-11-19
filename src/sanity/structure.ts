import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { apiVersion } from "./env";
import { ART_FORMS } from "./schemaTypes";

const list = (
  S: StructureBuilder,
  type: string,
  title: string,
  filter: string,
  params: Record<string, unknown> = {},
  orderField = "_createdAt",
  direction: "asc" | "desc" = "desc",
) =>
  S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .schemaType(type)
        .apiVersion(apiVersion)
        .filter(`_type == $type && ${filter}`)
        .params({ type, ...params })
        .defaultOrdering([{ field: orderField, direction }]),
    );

/** The studio sidebar, arranged around the jobs the studio owner actually does. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Archana's Art")
    .items([
      S.listItem()
        .title("Paintings")
        .child(
          S.list()
            .title("Paintings")
            .items([
              S.documentTypeListItem("artwork").title("All paintings"),
              list(S, "artwork", "Original in stock", `coalesce(stock, 1) > 0 && defined(priceOriginalINR)`),
              list(S, "artwork", "Original sold", `coalesce(stock, 1) <= 0`),
              list(S, "artwork", "With prints", `defined(pricePrintINR)`),
              list(S, "artwork", "On the homepage", `featured == true`),
              S.divider(),
              ...ART_FORMS.map((form) => list(S, "artwork", form, `category == $form`, { form })),
            ]),
        ),
      S.listItem()
        .title("Workshops & classes")
        .child(
          S.list()
            .title("Workshops & classes")
            .items([
              S.documentTypeListItem("workshop").title("All"),
              list(S, "workshop", "Upcoming", `coalesce(endDate, startDate) >= string::split(string(now()), "T")[0]`, {}, "startDate", "asc"),
              list(S, "workshop", "Past", `coalesce(endDate, startDate) < string::split(string(now()), "T")[0]`, {}, "startDate", "desc"),
            ]),
        ),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.listItem()
        .title("Orders")
        .child(
          S.list()
            .title("Orders")
            .items([
              list(S, "order", "Paid", `status == "paid"`, {}, "createdAt"),
              list(S, "order", "Payment not completed", `status == "pending"`, {}, "createdAt"),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("service").title("Services text"),
      S.documentTypeListItem("legalPage").title("Policy pages"),
      S.listItem()
        .title("Site settings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
    ]);
