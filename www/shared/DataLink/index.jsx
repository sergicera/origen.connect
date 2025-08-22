import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Typography,
  alpha,
} from "@mui/material";

import ReactFlow, {
  ReactFlowProvider,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";

// Import custom components
import CustomEdge from "./edges/CustomEdge";
import InputFileNode from "./nodes/InputFileNode";
import AppNode from "./nodes/AppNode";

import "reactflow/dist/style.css";

// Custom edge type configuration
const edgeTypes = {
  custom: CustomEdge,
};

// Custom node type configuration
const nodeTypes = {
  inputFile: InputFileNode,
  app: AppNode,
};

export default function DataLink({
  contents, 
  handleConnectionChange,
  appDisplayName = "App",
  appInputs = { loadData: { displayName: 'File Input', description: '', allowedContents: [] } },
  defaultConnections = [],
  fileMetadata = {},
  visibleContents = null,
}) {
  const theme = useTheme();
  // Create a stable instance ID to avoid remounting issues
  const instanceId = useRef(
    `flow-${Math.random().toString(36).substr(2, 9)}`
  ).current;
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  // Always keep animations enabled
  const isEdgeAnimated = true;

  // Initialize nodes based on available files
  const initialNodes = React.useMemo(() => {
    // Filter contents based on visibleContents if provided
    const filteredContents = visibleContents
      ? Object.fromEntries(
          Object.entries(contents || {}).filter(([key]) => 
            visibleContents.includes(key)
          )
        )
      : contents;

    const fileNodes = Object.entries(filteredContents || {}).map(([key], index) => {
      const metadata = fileMetadata[key] || {};
      return {
        id: key,
        type: "inputFile",
        position: { x: 50, y: index * 140 },
        data: {
          id: key,
          fileData: contents[key],
          label: metadata.displayName || key,
          description: metadata.description || "",
        },
        draggable: true,
      };
    });

    const appNode = {
      id: "app",
      type: "app",
      position: { x: 400, y: 100 },
      data: {
        displayName: appDisplayName,
        inputs: appInputs,
      },
      draggable: true,
    };

    return [...fileNodes, appNode];
  }, [contents, appDisplayName, appInputs, fileMetadata, visibleContents]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [connectionError, setConnectionError] = useState(null);

  // Create custom edge options
  const defaultEdgeOptions = {
    type: "custom",
    animated: isEdgeAnimated,
    style: { strokeWidth: 2 },
    markerEnd: {
      type: 'arrow',
      width: 15,
      height: 15,
      color: theme.palette.primary.main,
    }
  };

  // Initial setup - run once on mount
  useEffect(() => {
    setNodes(initialNodes);
  }, []);

  // Update nodes when inputs change
  useEffect(() => {
    setNodes((nodes) => {
      const updatedNodes = [...nodes];
      const appNodeIndex = updatedNodes.findIndex((node) => node.id === "app");

      if (appNodeIndex >= 0) {
        // Update existing app node
        updatedNodes[appNodeIndex] = {
          ...updatedNodes[appNodeIndex],
          data: {
            displayName: appDisplayName,
            inputs: { ...appInputs },
          },
        };
        return updatedNodes;
      } else {
        // If no app node exists yet, use initialNodes
        return initialNodes;
      }
    });
  }, [appInputs, appDisplayName, initialNodes]);

  // Handle file content changes
  useEffect(() => {
    if (contents) {
      setNodes((nodes) => {
        // Keep the app node
        const appNode = nodes.find((node) => node.id === "app");

        // Filter contents based on visibleContents if provided
        const filteredContents = visibleContents
          ? Object.fromEntries(
              Object.entries(contents || {}).filter(([key]) => 
                visibleContents.includes(key)
              )
            )
          : contents;

        // Create new file nodes
        const fileNodes = Object.entries(filteredContents || {}).map(([key], index) => {
          const metadata = fileMetadata[key] || {};
          return {
            id: key,
            type: "inputFile",
            position: { x: 50, y: index * 140 },
            data: {
              id: key,
              fileData: contents[key],
              label: metadata.displayName || key,
              description: metadata.description || "",
            },
            draggable: true,
          };
        });

        return appNode ? [...fileNodes, appNode] : fileNodes;
      });
    }
  }, [contents, fileMetadata, visibleContents]);

  // Set up default connections
  useEffect(() => {
    if (defaultConnections.length > 0 && contents && nodes.length > 0) {
      const initialEdges = defaultConnections
        .filter(
          (conn) =>
            contents[conn.source] &&
            conn.target === "app" &&
            conn.targetHandle &&
            nodes.some((node) => node.id === conn.source)
        )
        .map((conn) => ({
          id: `${conn.source}-${conn.targetHandle}`,
          source: conn.source,
          target: conn.target,
          targetHandle: conn.targetHandle,
          type: "custom",
          animated: isEdgeAnimated,
        }));

      setEdges(initialEdges);

      if (handleConnectionChange && initialEdges.length > 0) {
        const connections = initialEdges.map((edge) => ({
          source: edge.source,
          target: edge.target,
          targetHandle: edge.targetHandle,
        }));
        handleConnectionChange(connections);
      }
    }
  }, [
    defaultConnections,
    contents,
    nodes,
    setEdges,
    handleConnectionChange,
    isEdgeAnimated,
  ]);

  const onConnect = useCallback(
    (params) => {
      // Check if the connection is allowed based on file type
      const sourceId = params.source;
      const targetInputId = params.targetHandle?.replace("input-", "");

      if (targetInputId && appInputs[targetInputId]) {
        const allowedContents = appInputs[targetInputId].allowedContents || [];

        // If allowedContents is empty, allow all files. Otherwise, check if the source is allowed
        if (allowedContents.length > 0 && !allowedContents.includes(sourceId)) {
          // Connection not allowed - show error message
          setConnectionError(
            `File ${sourceId} is not allowed for input ${
              appInputs[targetInputId].displayName || targetInputId
            }`
          );
          setTimeout(() => setConnectionError(null), 3000);
          return;
        }
      }

      // Create connection with custom edge type
      const connection = {
        ...params,
        type: "custom",
        animated: isEdgeAnimated,
        id: `${params.source}-${params.targetHandle}`,
      };

      setEdges((eds) => {
        // Check if there's already a connection to this input
        const filteredEdges = eds.filter(
          (edge) => edge.targetHandle !== params.targetHandle
        );
        const newEdges = [...filteredEdges, connection];

        // Notify parent component about connection changes
        if (handleConnectionChange) {
          const connections = newEdges.map((edge) => ({
            source: edge.source,
            target: edge.target,
            targetHandle: edge.targetHandle,
          }));
          handleConnectionChange(connections);
        }
        return newEdges;
      });
    },
    [setEdges, handleConnectionChange, appInputs, isEdgeAnimated]
  );

  // Auto-layout on initial load and when content changes
  const autoLayout = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);

  // Auto-layout after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      autoLayout();
    }, 300);
    return () => clearTimeout(timer);
  }, [autoLayout, nodes]);

  // CSS for animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes flowAnimation {
        0% {
          stroke-dashoffset: 0;
        }
        100% {
          stroke-dashoffset: -10;
        }
      }
      .animated-edge path {
        stroke-dasharray: 5, 5;
        animation: flowAnimation 1s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  if (!contents) return null;

  return (
    <Box
      sx={{
        width: "100%",
        height: 500,
        mb: 2,
        position: "relative",
        overflow: "hidden",
        "& .react-flow__node": {
          transition: "transform 0.2s ease",
        },
        "& .react-flow__handle": {
          transition: "all 0.2s ease",
        },
      }}
      ref={reactFlowWrapper}
    >
      <ReactFlowProvider>
        <ReactFlow
          key={instanceId}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          onInit={onInit}
          proOptions={{ hideAttribution: true }}
          minZoom={0.5}
          maxZoom={2}
          snapToGrid
          snapGrid={[20, 20]}
          elevateEdgesOnSelect={true}
          elementsSelectable={true}
          nodesDraggable={true}
        >
          <Background
            variant="dots"
            gap={16}
            size={2}
            color={theme.palette.divider}
            style={{
              backgroundColor: alpha(theme.palette.background.default, 0.8),
            }}
          />
        </ReactFlow>

        {connectionError && (
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: alpha(theme.palette.error.main, 0.9),
              color: theme.palette.error.contrastText,
              p: 1.5,
              px: 2,
              borderRadius: 4,
              zIndex: 1000,
              boxShadow: theme.shadows[3],
              backdropFilter: "blur(4px)",
              transition: "all 0.3s ease",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <Typography variant="body2">{connectionError}</Typography>
          </Box>
        )}
      </ReactFlowProvider>
    </Box>
  );
}

DataLink.propTypes = {
  contents: PropTypes.object,
  handleConnectionChange: PropTypes.func,
  appDisplayName: PropTypes.string,
  appInputs: PropTypes.objectOf(
    PropTypes.shape({
      displayName: PropTypes.string,
      description: PropTypes.string,
      allowedContents: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  defaultConnections: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      targetHandle: PropTypes.string.isRequired
    })
  ),
  fileMetadata: PropTypes.objectOf(
    PropTypes.shape({
      displayName: PropTypes.string,
      description: PropTypes.string
    })
  ),
  visibleContents: PropTypes.arrayOf(PropTypes.string)
};
