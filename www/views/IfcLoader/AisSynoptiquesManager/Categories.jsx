import React from "react";
import {
    Typography,
    Box,
    IconButton,
    Stack,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function Categories({
    categories,
    selectedCategoryId,
    onCategorySelect,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    onSaveAttributes,
    onReloadAttributes,
}) {
    const theme = useTheme();

    return (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {/* Title and Action Buttons Row */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5, pl: 0.5 }}>
                <Typography variant="subtitle2">Categories:</Typography>
                {/* Group action buttons */}
                <Stack direction="row" spacing={0.5}>
                    <IconButton
                        size="small"
                        aria-label="reload attributes"
                        onClick={onReloadAttributes}
                        title="Reload Attributes from Disk"
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                     <IconButton
                        size="small"
                        aria-label="save attributes"
                        onClick={onSaveAttributes}
                        title="Save Attribute Changes"
                    >
                        <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        aria-label="add category"
                        onClick={onAddCategory}
                        title="Add New Category"
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>
            {/* Categories List */}
            {categories.length > 0 ? (
                categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                        <Box
                            key={cat.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 0.5,
                                borderRadius: theme.shape.borderRadius,
                                backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                                '& .category-actions': { visibility: 'hidden' },
                                '&:hover .category-actions': { visibility: 'visible' },
                            }}
                        >
                            {/* Clickable area for selection */}
                            <Box
                                onClick={() => onCategorySelect(cat.id)}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, cursor: 'pointer' }}
                            >
                                <Box
                                    sx={{
                                        width: 16, height: 16, backgroundColor: cat.color,
                                        border: `1px solid ${theme.palette.divider}`, flexShrink: 0
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}
                                >
                                    {cat.name}
                                </Typography>
                            </Box>
                            {/* Action Icons */}
                            <Box className="category-actions" sx={{ ml: 'auto' }}>
                                <IconButton
                                    size="small" aria-label={`edit ${cat.name}`} title="Edit Category"
                                    onClick={(e) => { e.stopPropagation(); onEditCategory(cat); }}
                                >
                                    <EditIcon fontSize="inherit" />
                                </IconButton>
                                <IconButton
                                    size="small" aria-label={`delete ${cat.name}`} title="Delete Category"
                                    onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat); }}
                                >
                                    <DeleteIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                        </Box>
                    );
                })
            ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center', p: 1 }}>
                    No categories defined for this synoptique.
                </Typography>
            )}
        </Box>
    );
} 