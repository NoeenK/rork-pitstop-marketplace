import { Category, Condition } from "@/types";

export const LISTING_CATEGORIES: Category[] = [
  "Drivetrain",
  "Electronics",
  "Pneumatics",
  "Structure",
  "Tools",
  "Misc",
];

export const LISTING_CONDITIONS: Condition[] = [
  "New",
  "Like New",
  "Good",
  "Used",
  "For Parts",
];

export const LISTING_CATEGORY_OPTIONS = LISTING_CATEGORIES.map((category) => ({
  label: category,
  value: category,
}));

export const LISTING_CONDITION_OPTIONS = LISTING_CONDITIONS.map((condition) => ({
  label: condition,
  value: condition,
}));



