// Local image imports
// Hero image removed - using video with placeholder
import product1Img from "../Images/product 1.jpeg";
import product2Img from "../Images/product 2.jpeg";
import product3Img from "../Images/product 3.jpeg";
import product4Img from "../Images/product 4.jpeg";
import product5Img from "../Images/product 5.jpeg";
import ruleImg from "../Images/rule.png";
import hoverGreenImg from "../Images/hover green.png";
import obsidianImg from "../Images/obsidian.png";
import brownImg from "../Images/brown.png";
import purpleImg from "../Images/purple.png";
import heroPlaceholderImg from "../Images/about.png";
// Import video
import heroVideoFile from "../Images/video.mp4";

// Hero video
export const heroVideoSrc: string = heroVideoFile;
// Hero placeholder (used for first paint before video draws its first frame)
// TODO: Replace `about.png` with a dedicated hero placeholder when available.
export const heroPlaceholderSrc: string = heroPlaceholderImg;

// Product images
export const productImages = {
  amethyst: product1Img,
  tigerEye: product2Img,
  blackTourmaline: product3Img,
  roseQuartz: product4Img,
  clearQuartz: product5Img,
  lapisLazuli: product4Img, // Reusing rose quartz image for lapis lazuli
};

// Other images
export const ruleImage = ruleImg;
export const hoverGreenImage = hoverGreenImg;
export const obsidianImage = obsidianImg;
export const brownImage = brownImg;
export const purpleImage = purpleImg;
// Temporary placeholders - uncomment imports above and use forHerImg/forHimImg when images are added
export const forHerImage = product1Img; // Replace with: forHerImg
export const forHimImage = product2Img; // Replace with: forHimImg
