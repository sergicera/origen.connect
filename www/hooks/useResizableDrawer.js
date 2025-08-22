import { useState, useCallback, useEffect, useRef } from 'react';

export function useResizableDrawer(initialWidth, minWidth, maxWidth, initialCollapsed = false) {
    const [drawerWidth, setDrawerWidth] = useState(initialWidth);
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null);

    // Calculate effective width for rendering
    const effectiveDrawerWidth = isCollapsed ? minWidth : drawerWidth;

    const toggleCollapse = useCallback(() => {
        setIsCollapsed((prev) => !prev);
        // Optional: Reset width when collapsing/expanding if desired
        // if (!isCollapsed) setDrawerWidth(initialWidth);
    }, [isCollapsed]);

    const startResizing = useCallback(
        (mouseDownEvent) => {
            if (isCollapsed) return;
            setIsResizing(true);
            // Prevent text selection during drag
            document.body.style.userSelect = "none";
            document.body.style.cursor = "col-resize";
        },
        [isCollapsed]
    );

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        // Remove listeners attached to window in the effect
    }, []);

    const resize = useCallback(
        (mouseMoveEvent) => {
            // Check if resizing and ref is valid
            if (isResizing && sidebarRef.current) {
                // Calculate new width based on mouse position relative to sidebar start
                const newWidth =
                    mouseMoveEvent.clientX -
                    sidebarRef.current.getBoundingClientRect().left;

                // Clamp the width between min and max bounds
                const clampedWidth = Math.max(
                    minWidth,
                    Math.min(newWidth, maxWidth)
                );

                setDrawerWidth(clampedWidth);
            }
        },
        [isResizing, minWidth, maxWidth] // Dependencies for the resize logic
    );

    // Effect to add/remove global mouse listeners for resizing
    useEffect(() => {
        const handleMouseMove = (e) => resize(e);
        const handleMouseUp = () => stopResizing();

        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            // Cleanup even if not currently resizing (safer)
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }

        // Cleanup function
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            // Ensure cursor/select styles are reset if component unmounts while resizing
            if (isResizing) {
                document.body.style.userSelect = "";
                document.body.style.cursor = "";
            }
        };
    }, [isResizing, resize, stopResizing]); // Effect dependencies

    // Return the state and handlers needed by the component
    return {
        drawerWidth,              // Raw width state (when not collapsed)
        isCollapsed,            // Boolean collapse state
        isResizing,             // Boolean resizing state
        sidebarRef,             // Ref to attach to the Drawer element
        effectiveDrawerWidth,   // Calculated width (minWidth if collapsed, drawerWidth otherwise)
        toggleCollapse,         // Function to toggle collapse state
        startResizing,          // Function to attach to the resize handle (onMouseDown)
    };
} 