import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useCoreContext } from '@/core/CoreContextProvider';

/**
 * This component is used to select the floor plan to display.
 */
export default function Floors({ selectedFloorId, onSelectFloor, isDataLoaded }) {
    const { getModule } = useCoreContext();
    const ifc = React.useMemo(() => getModule("ifc"), [getModule]);

    const [floorIds, setFloorIds] = React.useState([]);
    const [allViewers, setAllViewers] = React.useState([]);

    /**
     * This effect is used to get the unique floor ids from the ais data and set the floor ids to the state.
     * It also selects the first floor id if there is no selected floor id.
     * 
     * @param {boolean} isDataLoaded - Whether the data is loaded.
     * @param {object} ais - The ais module.
     * @param {function} onSelectFloor - The function to call when a floor is selected.
     * @param {string} selectedFloorId - The selected floor id.
     */
    React.useEffect(() => {
        if (isDataLoaded && ifc) {
            const uniqueIds = ifc.synoptiques.data.getUniqueFloorIds().sort();
            setFloorIds(uniqueIds);
            if (uniqueIds.length > 0 && !selectedFloorId) {
                onSelectFloor(uniqueIds[0]);
            }
        } else {
            setFloorIds([]);
        }
    }, [isDataLoaded, ifc, onSelectFloor, selectedFloorId]);

    /**
     * This effect is used to set the all viewers to the state.
     * 
     * @param {array} floorIds - The floor ids.
     */
    React.useEffect(() => {
        const viewers = [];
        if (floorIds && floorIds.length > 0) {
            floorIds.forEach((id) => {
                viewers.push({ type: "floorplan", floorId: id, title: `Floor: ${id}` });
            });
        }
        setAllViewers(viewers);
    }, [floorIds]);

    return (
        <FormControl fullWidth disabled={allViewers.length === 0}>
            <InputLabel id="floor-select-label">Select Floor Plan</InputLabel>
            <Select
                labelId="floor-select-label"
                id="floor-select"
                value={selectedFloorId || ""}
                label="Select Floor Plan"
                onChange={(event) => {
                    const floorId = event.target.value;
                    if (floorId) {
                        onSelectFloor(floorId);
                    }
                }}
            >
                {allViewers.map((viewerConfig) => (
                    <MenuItem
                        key={viewerConfig.floorId}
                        value={viewerConfig.floorId}
                    >
                        {viewerConfig.title}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
} 