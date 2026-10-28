import CategorySection from "@/components/Home/CategorySection";
import WhyDrapelo from "@/components/Home/WhyDrapelo";
import SizeChart from "@/components/Home/SizeChart";
import FeaturedProducts from "@/components/Home/FeaturedProducts";
import HeroImage from "@/components/Home/HeroImage";
import Jacket from "@/components/Home/Jacket";
import Reviews from "@/components/Home/Reviews";

export default async function Home() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-384 px-5">
      <HeroImage />
      <div className="racing-stripe my-8 h-1 opacity-80" aria-hidden />{" "}
      <FeaturedProducts />
      <CategorySection />
       <div className="checkered my-6 h-2 rounded-full" aria-hidden />
      <Jacket />
      <WhyDrapelo />
      <SizeChart />
      <Reviews />
    </div>
  );
}
