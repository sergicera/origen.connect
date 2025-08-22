export const zoningMapping = {
  ROOM: "Zone1",
  BEDROOM: "Zone1",
  BALCONY: "Zone4",
  KITCHEN: "Zone2",
  DINING: "Zone2",
  KITCHEN_DINING: "Zone2",
  LIVING_ROOM: "Zone2",
  LIVING_DINING: "Zone2",
  BATHROOM: "Zone3",
  CORRIDOR: "Zone2",
  CORRIDORS_AND_HALLS: "Zone2",
  STAIRS: "Zone3",
  STAIRCASE: "Zone3",
  ELEVATOR: "Zone3",
  RAILING: "Structure",
  ROOF: "Zone4",
  VOID: "Zone3",
  SHAFT: "Structure",
  WALL: "Structure",
  COLUMN: "Structure",
  STOREROOM: "Zone3",
  ENTRANCE_DOOR: "Entrance Door",
  DOOR: "Door",
  WINDOW: "Window",
};


// Dark mode
export const colorMapZoning = {
  Zone1: "#54A9FF", // Enhanced blue for better contrast with dark background
  Zone2: "#FF9A3D", // Brighter orange for living areas
  Zone3: "#B764AE", // Lighter, more saturated purple for better visibility
  Zone4: "#4AE3A9", // Vibrant teal-green for balcony/outdoor areas
  Structure: "#E2E8F0", // Light gray instead of black for better visibility on dark background
  Door: "#54A9FF", // Matching Zone1 color as in original
  "Entrance Door": "#BBFF7D", // Brighter, more visible green
  Window: "#FF5252", // Brighter red for better visibility
};
