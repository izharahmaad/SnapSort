import { DisposalCategory } from "../types/scan";
import { colors } from "./theme";

interface CategoryMeta {
  label: string;
  color: string;
  icon: string;
  description: string;
}

export const categoryMeta: Record<DisposalCategory, CategoryMeta> = {
  recycle: {
    label: "Recycle",
    color: colors.recycle,
    icon: "recycle",
    description: "This item may be suitable for recycling.",
  },
  reuse: {
    label: "Reuse",
    color: colors.reuse,
    icon: "leaf",
    description: "Try using this item again before discarding it.",
  },
  donate: {
    label: "Donate",
    color: colors.donate,
    icon: "gift",
    description: "This item may still help someone else.",
  },
  sell: {
    label: "Sell",
    color: colors.sell,
    icon: "tag",
    description: "This item may have resale value.",
  },
  trash: {
    label: "Trash",
    color: colors.trash,
    icon: "delete",
    description: "This item may need regular waste disposal.",
  },
  hazardous: {
    label: "Hazardous",
    color: colors.hazardous,
    icon: "alert",
    description: "Do not put this in normal household trash.",
  },
  unknown: {
    label: "Not sure",
    color: colors.unknown,
    icon: "help-circle",
    description: "Take a clearer photo or check local guidance.",
  },
};