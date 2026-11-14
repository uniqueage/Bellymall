import type { Metadata } from "next";
import { CATEGORIES } from "../../../src/data";
import { CategoryPage } from "../../../src/views/CategoryPage";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ id: category.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const category = CATEGORIES.find((c) => c.id === id);
  if (!category) {
    return { title: "Stall not found", robots: { index: false, follow: true } };
  }
  return {
    title: `${category.name} — ${category.slogan}`,
    description: category.blurb,
    alternates: { canonical: `/stall/${category.id}` },
    openGraph: {
      title: `${category.name} · Bellymall`,
      description: category.blurb,
      url: `/stall/${category.id}`,
      images: [{ url: category.image, alt: category.imageAlt }],
    },
  };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  return <CategoryPage id={id} />;
}
