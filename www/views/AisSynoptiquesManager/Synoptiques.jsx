import React from "react";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Divider,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useAuthToken } from "@/www/hooks/useAuthToken";
import { useCoreContext } from '@/core/CoreContextProvider';
import CategoryManager from './Categories';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

// Default color for new categories
const DEFAULT_CATEGORY_COLOR = "#808080"; 

/**
 * This component is used to select the synoptique to display.
 */
export default function Synoptiques({
    isDataLoaded,
    selectedSynoptiqueId,
    onSynoptiqueChange,
    selectedCategoryId,
    onCategorySelect,
    exerciceId,
    modelId,
}) {
    const theme = useTheme();
    const token = useAuthToken();
    const { getModule, subscribe } = useCoreContext();
    const ifc = React.useMemo(() => getModule("ifc"), [getModule]);

    const [synoptiques, setSynoptiques] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [addSynoptiqueDialogOpen, setAddSynoptiqueDialogOpen] = React.useState(false);
    const [newSynoptiqueName, setNewSynoptiqueName] = React.useState("");
    // State for Add Category Dialog
    const [addCategoryDialogOpen, setAddCategoryDialogOpen] = React.useState(false);
    const [newCategoryName, setNewCategoryName] = React.useState("");
    const [newCategoryColor, setNewCategoryColor] = React.useState(DEFAULT_CATEGORY_COLOR);

    /**
     * Subscribe to changes in the synoptiques list.
     */
    React.useEffect(() => {
        const unsubscribe = subscribe((eventName, payload) => {
          if (eventName === "SYNOPTIQUES_LIST_CHANGED") {
            const loadedSynoptiques = ifc.synoptiques.data.getSynoptiques();
            setSynoptiques(loadedSynoptiques);
          }
        });
        return () => unsubscribe();
      }, [subscribe]);

    /**
     * This effect is used to get the synoptiques from the ais data and set the synoptiques to the state.
     * 
     * @param {boolean} isDataLoaded - Whether the data is loaded.
     * @param {object} ais - The ais module.
     */
    React.useEffect(() => {
        if (isDataLoaded && ifc) {
            const loadedSynoptiques = ifc.synoptiques.data.getSynoptiques();
            setSynoptiques(loadedSynoptiques);
            console.log("Synoptiques component loaded synoptiques:", loadedSynoptiques);
        } else {
            setSynoptiques([]);
        }
    }, [isDataLoaded, ifc]);

    /**
     * This effect is used to get the categories for the selected synoptique and set the categories to the state.
     * 
     * @param {object} ais - The ais module.
     * @param {string} selectedSynoptiqueId - The selected synoptique id.
     */
    React.useEffect(() => {
        if (ifc && selectedSynoptiqueId) {
            const synoptiqueCategories = ifc.synoptiques.data.getCategoriesForSynoptique(selectedSynoptiqueId);
            setCategories(synoptiqueCategories);
            console.log(`Synoptiques component loaded categories for ${selectedSynoptiqueId}:`, synoptiqueCategories);
        } else {
            setCategories([]);
        }
    }, [ifc, selectedSynoptiqueId]);

    /**
     * Subscribe to changes in category mapping (covers add/edit/delete of categories too)
     * to keep the displayed category list up-to-date.
     */
    React.useEffect(() => {
        const unsubscribe = subscribe((eventName, payload) => {
            // Listen specifically for changes to the category list itself
            if (eventName === "CATEGORY_LIST_CHANGED") {
                // Optional: Check if the change affects the currently selected synoptique
                // if (payload && payload.synoptiqueId !== selectedSynoptiqueId) return;
                
                if (ifc && selectedSynoptiqueId) {
                    // Refetch categories for the currently selected synoptique
                    const updatedCategories = ifc.synoptiquesdata.getCategoriesForSynoptique(selectedSynoptiqueId);
                    setCategories(updatedCategories);
                    console.log(`Synoptiques component refreshed categories for ${selectedSynoptiqueId}:`, updatedCategories);
                } 
            }
        });
        return () => unsubscribe();
    }, [subscribe, ifc, selectedSynoptiqueId]); // Need selectedSynoptiqueId to refetch specific categories

    // --- Synoptique Actions ---
    const handleAddSynoptique = () => {
        setNewSynoptiqueName("");
        setAddSynoptiqueDialogOpen(true);
    };

    const handleCloseAddSynoptiqueDialog = () => {
        setAddSynoptiqueDialogOpen(false);
    };

    const handleConfirmAddSynoptique = () => {
        const trimmedName = newSynoptiqueName.trim();
        if (trimmedName && ifc && exerciceId && modelId && token) {
            ifc.synoptiques.data.addSynoptique(trimmedName, exerciceId, modelId, token)
                .then((newSynoptiqueId) => { 
                    handleCloseAddSynoptiqueDialog();
                    if (newSynoptiqueId && onSynoptiqueChange) {
                        onSynoptiqueChange(newSynoptiqueId);
                    }
                })
                .catch(error => {
                    console.error("Error adding synoptique:", error);
                });
        } else {
            console.warn("Cannot add synoptique, parameters missing");
        }
    };

    const handleEditSynoptique = (syn, event) => {
        event.stopPropagation(); // Prevent menu close
        console.log("TODO: Open Edit Synoptique Dialog for", syn); // Placeholder
    };
    const handleDeleteSynoptique = (syn, event) => {
        event.stopPropagation(); // Prevent menu close
        console.log("TODO: Open Delete Synoptique Confirm for", syn); // Placeholder
    };

    // --- Category Actions ---
    const handleAddCategory = () => { 
        setNewCategoryName("");
        setNewCategoryColor(DEFAULT_CATEGORY_COLOR); // Reset color
        setAddCategoryDialogOpen(true); 
    };
    const handleCloseAddCategoryDialog = () => {
        setAddCategoryDialogOpen(false);
    };

    const handleConfirmAddCategory = () => {
        const trimmedName = newCategoryName.trim();
        // Basic hex color validation (starts with #, 7 chars long)
        const isValidColor = /^#[0-9A-F]{6}$/i.test(newCategoryColor);

        if (trimmedName && isValidColor && ifc && selectedSynoptiqueId && exerciceId && modelId && token) {
            ifc.synoptiques.data.addCategoryToSynoptique(selectedSynoptiqueId, trimmedName, newCategoryColor, exerciceId, modelId, token)
                .then((newCategory) => { // Expecting the new category object back
                    if (newCategory) {
                         console.log(`Category "${trimmedName}" added successfully to synoptique ${selectedSynoptiqueId}.`);
                         // The subscription effect should handle updating the list
                         handleCloseAddCategoryDialog();
                    } else {
                         console.error("Failed to add category (API returned null/undefined).");
                         // Maybe show an error to the user here
                    }
                })
                .catch(error => {
                    console.error("Error adding category:", error);
                    // Maybe show an error to the user here
                });
        } else {
            let warning = "Cannot add category.";
            if (!trimmedName) warning += " Name is missing.";
            if (!isValidColor) warning += " Invalid color format (use #rrggbb).";
            if (!selectedSynoptiqueId) warning += " No synoptique selected.";
            // Add more specific checks if needed
            console.warn(warning);
            // TODO: Show feedback in the dialog
        }
    };

    const handleEditCategory = (category) => { console.log("TODO: Open Edit Dialog for", category); };
    const handleDeleteCategory = (category) => { console.log("TODO: Open Delete Confirm for", category); };

    // --- Attribute Actions ---
    const handleSaveAttributes = () => {
        if (ifc && exerciceId && modelId && token) {
            console.log(`Synoptiques: Saving attributes for exercice ${exerciceId}, model ${modelId}`);
            ifc.synoptiques.data.saveAttributes(exerciceId, modelId, token)
                .then(() => {
                    console.log("Synoptiques: Attributes saved successfully.");
                    // TODO: Add user feedback (e.g., snackbar)
                })
                .catch(error => {
                    console.error("Synoptiques: Error saving attributes:", error);
                    // TODO: Add user feedback (e.g., snackbar)
                });
        } else {
            console.warn("Cannot save attributes, parameters missing (ais, exerciceId, modelId, token)");
        }
    };

    const handleReloadAttributes = () => {
        console.log("TODO: Implement attribute reload");
        // Placeholder for future implementation
        // This would likely involve:
        // 1. Clearing current attributes in ais.data (maybe add a clearAttributes method?)
        // 2. Re-triggering the loadAttributes function in ais.data
        // 3. Potentially updating the UI state based on the reloaded data.
    };

    return (
        <>
            {/* Synoptique Selection */} 
            <FormControl fullWidth disabled={!isDataLoaded || synoptiques.length === 0} sx={{ mb: 2 }}> {/* Removed Stack, added mb here */} 
                <InputLabel id="synoptique-select-label">Select Synoptique</InputLabel>
                <Select
                    labelId="synoptique-select-label"
                    id="synoptique-select"
                    value={selectedSynoptiqueId || ""}
                    label="Select Synoptique"
                    onChange={(event) => onSynoptiqueChange(event.target.value || null)}
                    // Render function to customize menu items
                    renderValue={(selected) => {
                        if (!selected) {
                            return <em>None</em>;
                        }
                        return synoptiques.find(s => s.id === selected)?.name || "";
                    }}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {synoptiques.map((syn) => (
                        <MenuItem key={syn.id} value={syn.id} sx={{ justifyContent: 'space-between' }}>
                            {syn.name} 
                            {/* Inline Action Icons */}
                            <Box onClick={(e) => e.stopPropagation()} sx={{ ml: 2 }}> {/* Stop propagation on the container too */} 
                                <IconButton 
                                    size="small" 
                                    aria-label={`edit ${syn.name}`}
                                    onClick={(e) => handleEditSynoptique(syn, e)} 
                                    title="Edit Synoptique"
                                >
                                    <EditIcon fontSize="inherit" />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    aria-label={`delete ${syn.name}`}
                                    onClick={(e) => handleDeleteSynoptique(syn, e)}
                                    title="Delete Synoptique"
                                >
                                    <DeleteIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                        </MenuItem>
                    ))}
                    {/* Add Divider and Add Item */} 
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem 
                        onClick={handleAddSynoptique} 
                        disabled={!isDataLoaded} // Disable if data isn't loaded
                        sx={{ justifyContent: 'center' }} 
                        title="Add New Synoptique"
                    >
                        <AddIcon />
                    </MenuItem>
                </Select>
            </FormControl>

            {/* Render Category Manager */}
            {selectedSynoptiqueId && (
                <CategoryManager
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategorySelect={onCategorySelect}
                    onAddCategory={handleAddCategory}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onSaveAttributes={handleSaveAttributes}
                    onReloadAttributes={handleReloadAttributes}
                />
            )}

            {/* Add Category Dialog */} 
            <Dialog open={addCategoryDialogOpen} onClose={handleCloseAddCategoryDialog}>
                <DialogTitle>Add New Category to Synoptique</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="category-name"
                        label="Category Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                     <TextField
                        margin="dense"
                        id="category-color"
                        label="Category Color (e.g., #FF0000)"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        // Basic preview
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ width: 20, height: 20, backgroundColor: newCategoryColor, border: '1px solid grey', mr: 1 }} />
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddCategoryDialog}>Cancel</Button>
                    <Button 
                        onClick={handleConfirmAddCategory} 
                        disabled={!newCategoryName.trim() || !/^#[0-9A-F]{6}$/i.test(newCategoryColor)} // Disable if name empty or color invalid
                    >
                        Add Category
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Synoptique Dialog */}
            <Dialog open={addSynoptiqueDialogOpen} onClose={handleCloseAddSynoptiqueDialog}>
                <DialogTitle>Add New Synoptique</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="synoptique-name"
                        label="Synoptique Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newSynoptiqueName}
                        onChange={(e) => setNewSynoptiqueName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddSynoptiqueDialog}>Cancel</Button>
                    <Button onClick={handleConfirmAddSynoptique} disabled={!newSynoptiqueName.trim()}>Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
} 