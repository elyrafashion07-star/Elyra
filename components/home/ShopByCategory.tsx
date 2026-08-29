import CategoryCarousel from "@/components/home/CategoryCarousel";
import { homeCollections } from "@/lib/collections";

export default async function ShopByCategory() {
  const categories = await homeCollections("category");
  if (!categories.length) return null;

  return (
    <CategoryCarousel
      tiles={categories.map((c) => ({ handle: c.handle, title: c.title, image: c.image }))}
    />
  );
}
