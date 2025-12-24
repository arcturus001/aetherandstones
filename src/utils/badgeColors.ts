const badgePalette = [
  "#D1A95B",
  "#E84F2D",
  "#4FB4FF",
  "#B35AFF",
  "#32D18A",
  "#F3C16D",
  "#FF7F50",
  "#7ACB9E",
];

export const getBadgeColor = (property: string) => {
  let hash = 0;
  for (let i = 0; i < property.length; i += 1) {
    hash = (hash + property.charCodeAt(i)) % badgePalette.length;
  }
  return badgePalette[hash];
};


