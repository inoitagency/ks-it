import { SmoothScroll } from "./smooth-scroll";
import { Hero } from "./hero";
import { SchoolTitle } from "./school-title";
import { Programs } from "./programs";
import { HODs } from "./hods";
import { Gallery } from "./gallery";
import  Infrastructure  from "./infrastructure";
import { CampusExperience } from "./campus-experience";
import { CurtainFooter } from "./curtain-footer";

export const SmoothScrollHero = () => {
  return (
    <div className="bg-white">
      <SmoothScroll>
        <Hero />
        <SchoolTitle />
        <Programs />
        <HODs />
        <Gallery />
        <Infrastructure />
        <CampusExperience />
        <CurtainFooter />
      </SmoothScroll>
    </div>
  );
};
