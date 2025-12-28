import { productImages } from "../assets";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  stone: string;
  properties: string[];
  featured: boolean;
  inStock: boolean;
  forHer?: boolean;
  forHim?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Amethyst Power Bracelet",
    description:
      "Support a sense of safety and grounding by helping shield your energy from stress, negativity, and external pressure throughout the day.",
    price: 89,
    originalPrice: 120,
    image: productImages.amethyst,
    stone: "Amethyst",
    properties: ["Protection", "Clarity", "Spirituality"],
    featured: true,
    inStock: true,
    forHer: true,
    forHim: false,
  },
  {
    id: "2",
    name: "Tiger Eye Balance Bracelet",
    description:
      "Encourage self-trust, inner strength, and the courage to move forward with clarity and assurance in your decisions.",
    price: 75,
    image: productImages.tigerEye,
    stone: "Tiger Eye",
    properties: ["Confidence", "Willpower", "Clarity"],
    featured: true,
    inStock: true,
    forHer: false,
    forHim: true,
  },
  {
    id: "4",
    name: "Rose Quartz Love Bracelet",
    description:
      "Foster compassion, emotional openness, and deeper connection with yourself and others.",
    price: 65,
    image: productImages.roseQuartz,
    stone: "Rose Quartz",
    properties: ["Love", "Compassion", "Heart Healing"],
    featured: true,
    inStock: true,
    forHer: true,
    forHim: false,
  },
  {
    id: "5",
    name: "Clear Quartz Clarity Bracelet",
    description:
      "Enhance and strengthen personal intentions by magnifying focus, energy, and purpose.",
    price: 55,
    image: productImages.clearQuartz,
    stone: "Clear Quartz",
    properties: ["Amplification", "Clarity", "Energy"],
    featured: false,
    inStock: true,
    forHer: true,
    forHim: true,
  },
  {
    id: "6",
    name: "Lapis Lazuli Wisdom Bracelet",
    description:
      "Support thoughtful insight, intuition, and balanced decision-making through greater mental and emotional awareness.",
    price: 110,
    image: productImages.roseQuartz,
    stone: "Lapis Lazuli",
    properties: ["Wisdom", "Truth", "Communication"],
    featured: false,
    inStock: false,
    forHer: false,
    forHim: true,
  },
];







