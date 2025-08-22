import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useCoreContext } from '@/core/CoreContextProvider';

function Filter({ allPresets, activeFilters, onFilterChange }) {
  const { getModule } = useCoreContext();
  const ifc = React.useMemo(() => getModule("ifc"), [getModule]);

  // Internal state for available presets
  const [availablePresets, setAvailablePresets] = React.useState({});

  // Effect to recalculate available presets when filters or allPresets change
  React.useEffect(() => {
    if (ifc && allPresets) { // Check if ais and allPresets are ready
      const currentAvailable = ifc.synoptiques.data.getAvailablePresets(activeFilters);
      setAvailablePresets(currentAvailable);
      console.log("Filter component recalculated available presets:", currentAvailable);
    } else {
      setAvailablePresets({}); // Reset if ais or allPresets aren't ready
    }
  }, [ifc, allPresets, activeFilters]); // Dependencies: ais, allPresets, activeFilters

  // Get keys from all presets to ensure all filter categories are displayed
  const allPresetKeys = allPresets ? Object.keys(allPresets).filter(key => allPresets[key] && allPresets[key].length > 0) : [];

  // Helper function to check if a value is available for a given key
  const isValueAvailable = (key, value) => {
    return availablePresets && availablePresets[key] && availablePresets[key].includes(value);
  };

  // New handler for chip clicks
  const handleChipClick = (key, value) => {
    const currentActive = activeFilters[key] || [];
    const newActive = currentActive.includes(value)
      ? currentActive.filter(item => item !== value) // Remove value if it exists
      : [...currentActive, value]; // Add value if it doesn't exist
    onFilterChange(key, newActive);
  };

  // Handle cases where presets might be null or empty initially
  if (!allPresets || allPresetKeys.length === 0) {
      return <Box sx={{ p: 2, fontStyle: 'italic' }}>No filterable metadata available.</Box>;
  }

  return (
    // Align columns to the right
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 4, pt: 2 }}>
      {allPresetKeys.map((key) => (
        // Align items within column to the right
        <Box key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          {/* Use Typography for the filter key label */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Typography>
          {/* Container for the chips, align chips to the right */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1 }}>
            {(allPresets[key] || []).map((value) => {
              // Determine if the current chip value is selected
              const isSelected = (activeFilters[key] || []).includes(value);
              // Determine if the current chip value is available based on other filters
              const isAvailable = isValueAvailable(key, value);

              return (
                <Chip
                  key={value}
                  label={value}
                  clickable // Always clickable
                  onClick={() => handleChipClick(key, value)} // Always attach onClick
                  // Style chip based on selection and availability status
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : (isAvailable ? 'outlined' : 'filled')} // Filled and default color if unavailable but not selected
                  size="small"
                  // Add styling for unavailable chips (without affecting clickability)
                  sx={!isAvailable && !isSelected ? { // Only apply muted style if unavailable AND not selected
                    backgroundColor: 'action.disabledBackground',
                    color: 'action.disabled',
                    // Keep cursor as pointer to indicate clickability
                    '&:hover': {
                       // Slightly lighten background on hover for unavailable chips
                      backgroundColor: theme => theme.palette.action.hover, 
                    }
                  } : {}}
                />
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default Filter;
