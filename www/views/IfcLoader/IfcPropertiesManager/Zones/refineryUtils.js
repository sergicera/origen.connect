export function getHierarchyOptions(zones, overrides = {}) {
  const options = {};

  // Extract all possible hierarchy keys from zones (if available) and overrides
  const hierarchyKeysFromZones =
    zones && zones.length > 0 ? Object.keys(zones[0].hierarchy) : [];
  const hierarchyKeysFromOverrides = overrides ? Object.keys(overrides) : [];
  const allHierarchyKeys = [
    ...new Set([...hierarchyKeysFromZones, ...hierarchyKeysFromOverrides]),
  ];

  allHierarchyKeys.forEach((key) => {
    const uniqueValues = new Set();

    // Add values from zones if the key exists in zones' hierarchy
    if (zones && zones.length > 0 && hierarchyKeysFromZones.includes(key)) {
      zones.forEach((zone) => {
        const value = zone.hierarchy[key];
        if (value !== null) {
          uniqueValues.add(value);
        }
      });
    }

    // Add values from overrides.select if present
    if (overrides && overrides[key] && Array.isArray(overrides[key].select)) {
      overrides[key].select.forEach((value) => {
        if (value !== null && value !== undefined) {
          uniqueValues.add(value);
        }
      });
    }

    options[key] = Array.from(uniqueValues);
  });

  return options;
}
