export function parseCSVLine(line) {
  const parts = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      parts.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  parts.push(current.trim());

  return {
    id: parts[0],
    guuid: parts[1],
    project_id: parts[2],
    site_id: parts[3],
    building_id: parts[4],
    floor_id: parts[5],
    facility_id: parts[6],
    unit_id: parts[7],
    space_id: parts[8],
    facility_type: parts[9],
    unit_type: parts[10],
    entity_group: parts[11],
    entity_type: parts[12],
    entity_subtype: parts[13],
    geom: parts[14],
    elevation: parts[15],
    height: parts[16],
    sia416: parts[17]
  };
}