export const CONFIGS = {
  palette: "light", // "dark" or "light"
  fontFamily: "Arial, sans-serif",
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

export const PALETTES = {
  dark: {
    textColor: "rgba(224, 224, 224, 1)",
  },
  light: {
    textColor: "rgba(51, 51, 51, 1)",
  },
};

export const THEME = {
  mapping: {
    ROOM: "Zone",
    BEDROOM: "Zone",
    BALCONY: "Zone",
    KITCHEN: "Zone",
    DINING: "Zone",
    KITCHEN_DINING: "Zone",
    LIVING_ROOM: "Zone",
    LIVING_DINING: "Zone",
    BATHROOM: "Zone",
    CORRIDOR: "Zone",
    CORRIDORS_AND_HALLS: "Zone",
    STAIRS: "Zone",
    STAIRCASE: "Zone",
    ELEVATOR: "Zone",
    RAILING: "Separator",
    ROOF: "Zone",
    VOID: "Zone",
    SHAFT: "Separator",
    WALL: "Separator",
    COLUMN: "Separator",
    STOREROOM: "Zone",
    ENTRANCE_DOOR: "Door",
    DOOR: "Door",
    WINDOW: "Window",
  },
  order: ["Zone", "Separator", "Door", "Window"],
  border: {
    light: {
      Zone: ["rgba(220, 220, 220, 1)", 1],
      Door: ["rgba(200, 200, 200, 1)", 1],
      Window: ["rgba(200, 200, 200, 1)", 1],
      Separator: ["rgba(180, 180, 180, 1)", 1]
    },
    dark: {
      Zone: ["rgba(200, 200, 200, 1)", 1],
      Door: ["rgba(220, 220, 220, 1)", 1],
      Window: ["rgba(220, 220, 220, 1)", 1],
      Separator: ["rgb(240, 240, 240, 1)", 1]
    },
  },
  fill: {
    light: {
      Zone: "rgba(230, 230, 230, 1)",
      Door: "rgba(210, 210, 210, 1)",
      Window: "rgba(210, 210, 210, 1)",
      Separator: "rgba(190, 190, 190, 1)",
    },
    dark: {
      Zone: "rgba(190, 190, 190, 1)",
      Door: "rgba(210, 210, 210, 1)",
      Window: "rgba(210, 210, 210, 1)",
      Separator: "rgba(230, 230, 230, 1)",

    },
  },
};
