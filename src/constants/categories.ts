import type {
  DisposalCategory,
} from "../types/scan";

export type CategoryMeta = {
  label: string;
  icon: string;
  color: string;
};

export const categoryMeta: Record<
  DisposalCategory,
  CategoryMeta
> = {
  recycle: {
    label: "Recycle",
    icon: "recycle",
    color: "#2E8B57",
  },

  compost: {
    label: "Compost",
    icon: "leaf",
    color: "#8B6F47",
  },

  trash: {
    label: "General waste",
    icon: "delete-outline",
    color: "#6B7280",
  },

  reuse: {
    label: "Reuse",
    icon: "refresh",
    color: "#C87912",
  },

  hazardous: {
    label: "Hazardous",
    icon: "alert-outline",
    color: "#C2410C",
  },
};