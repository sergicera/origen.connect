import React, { useMemo } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { colorMapZoning, zoningMapping } from '@/core/src/main/SwissApartmentsDataset/Viewer/colors';

// Helper function to format subtype names (optional, but nice)
const formatSubtypeName = (name) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Replace underscores, capitalize words
};

export default function Legend() {
  const theme = useTheme();

  // Process mapping to group subtypes by Zone Category
  const groupedZones = useMemo(() => {
    const groups = {};
    for (const [subtype, zoneCat] of Object.entries(zoningMapping)) {
      const color = colorMapZoning[zoneCat];
      // Only include zones that have a color defined
      if (color) {
        if (!groups[zoneCat]) {
          groups[zoneCat] = {
            color: color,
            subtypes: []
          };
        }
        groups[zoneCat].subtypes.push(subtype);
      }
    }
    // Sort subtypes alphabetically within each group
    Object.values(groups).forEach(group => group.subtypes.sort());
    // Convert to array and sort zones (optional)
    return Object.entries(groups).sort(([zoneA], [zoneB]) => zoneA.localeCompare(zoneB));
  }, []);

  if (groupedZones.length === 0) {
    return null; // Don't render anything if no zones are processed
  }

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(1.5),
        width: '100%',
        overflowY: 'auto',
        display: 'flex',
        gap: theme.spacing(2.5),
        zIndex: 10,
      }}
    >
      {groupedZones.map(([zoneCat, { color, subtypes }]) => (
        <Box
          key={zoneCat}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: theme.spacing(1),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: color,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '3px',
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
              {zoneCat}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5), alignItems: 'flex-start' }}>
               {subtypes.map(subtype => (
                  <Chip
                    key={subtype}
                    label={formatSubtypeName(subtype)}
                    size="small"
                    variant="outlined"
                  />
               ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
} 