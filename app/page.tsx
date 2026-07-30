import HeroSlider from "@/components/home/HeroSlider";
import TrustStrip from "@/components/home/TrustStrip";
import TrendingProducts from "@/components/home/TrendingProducts";
import ShopByOccasion from "@/components/home/ShopByOccasion";
import ShopByCategory from "@/components/home/ShopByCategory";
import ExploreCollections from "@/components/home/ExploreCollections";
import ShopByBudget from "@/components/home/ShopByBudget";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ShopByGender from "@/components/home/ShopByGender";
import GiftingEdit from "@/components/home/GiftingEdit";
import VideoSection from "@/components/home/VideoSection";
import AuthenticityBanner from "@/components/home/AuthenticityBanner";
import Newsletter from "@/components/home/Newsletter";

/**
 * Homepage section order mirrors the reference layout, top to bottom.
 * 1 Hero · 2 Trust · 3 Trending · 4 Occasion · 5 Category · 6 Collections
 * 7 Budget · 8 Why Us · 9 Gender · 10 Gifting · 11 Video · 12 Authenticity · 13 Newsletter
 */
export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <TrustStrip />
      <TrendingProducts />
      <ShopByOccasion />
      <ShopByCategory />
      <ExploreCollections />
      <ShopByBudget />
      <WhyChooseUs />
      <ShopByGender />
      <GiftingEdit />
      <VideoSection />
      <AuthenticityBanner />
      <Newsletter />
    </>
  );
}
