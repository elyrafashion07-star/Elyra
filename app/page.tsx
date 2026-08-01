import HeroSlider from "@/components/home/HeroSlider";
import TrustStrip from "@/components/home/TrustStrip";
import TrendingProducts from "@/components/home/TrendingProducts";
import ShopByOccasion from "@/components/home/ShopByOccasion";
import ShopByCategory from "@/components/home/ShopByCategory";
import ShopByBudget from "@/components/home/ShopByBudget";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ShopByGender from "@/components/home/ShopByGender";
import GiftingEdit from "@/components/home/GiftingEdit";
import Newsletter from "@/components/home/Newsletter";

/**
 * Homepage section order, top to bottom.
 * 1 Hero · 2 Trust · 3 Trending · 4 Occasion · 5 Category
 * 6 Budget · 7 Why Us · 8 Gender · 9 Gifting · 10 Newsletter
 */
export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <TrustStrip />
      <TrendingProducts />
      <ShopByOccasion />
      <ShopByCategory />
      <ShopByBudget />
      <WhyChooseUs />
      <ShopByGender />
      <GiftingEdit />
      <Newsletter />
    </>
  );
}
