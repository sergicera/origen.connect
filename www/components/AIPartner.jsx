import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // Or highlight.js theme
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  useTheme,
  Slide,
  Snackbar,
  Alert,
} from "@mui/material";
import { Send, Person, SmartToy } from "@mui/icons-material";
import { useAppContext } from "@/www/store/context-provider";

export function ChatBot() {
  const theme = useTheme();
  const [{ entreprises, models }] = useAppContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const tenantId = useMemo(
    () => entreprises?.currentEntrepriseId,
    [entreprises]
  );

  const modelId = useMemo(() => models?.currentModelId, [models]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- handleSubmit FUNCTION (logic remains the same as last working version) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    const messageToSend = input;
    const currentUserMessage = { role: "user", content: messageToSend };

    setMessages((prevMessages) => [...prevMessages, currentUserMessage]);
    setInput("");

    try {
      const payload = {
        query: messageToSend,
        data: {
          TENANT_ID: "vjLXfYt5r36pjLCorpuGFW",
          MODEL_ID: "q8mjev6d34oLiyfDQYa49g",
          BUILDING_ID: "59713c886587326121c55ad900cd3544",
        },
      };

      const response = await axios.post(
        `${BASE_URL}/api/chat`,
        payload
      );

      if (
        response.data &&
        response.data.response &&
        Array.isArray(response.data.response.messages)
      ) {
        const backendMessages = response.data.response.messages;

        const formattedHistory = backendMessages.map((msg) => ({
          role: msg.type === "human" ? "user" : "assistant",
          content: msg.content,
        }));

        setMessages(formattedHistory);
      } else {
        console.error(
          "Backend response format error or missing 'response.messages' array:",
          response.data
        );
        setError("Received an unexpected response format from the server.");
      }
    } catch (error) {
      console.error(
        "Error during API call:",
        error.toJSON ? error.toJSON() : error
      );
      let errorMsg = "Failed to get response. Please try again.";
      if (error.response) {
        errorMsg = `Error ${error.response.status}: ${
          error.response.data?.detail ||
          error.response.statusText ||
          "Server error"
        }`;
      } else if (error.request) {
        errorMsg =
          "No response received from the server. Check connection or server status.";
      } else {
        errorMsg =
          error.message || "An unknown error occurred during the request.";
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 0);
    }
  };
  // --- END OF handleSubmit FUNCTION ---

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: 0,
      }}
    >
      {/* Message List Rendering (remains the same as last working version) */}
      <List
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          bgcolor: "transparent", // Make background transparent
          // border: `1px solid ${theme.palette.divider}`, // Add border
          borderRadius: theme.shape.borderRadius,
          mb: 2,
          minHeight: 0,
          scrollbarWidth: "none", // For Firefox
          "&::-webkit-scrollbar": { display: "none" }, // For Chrome, Safari, Edge
        }}
      >
        {messages.map((msg, index) =>
          msg.content && typeof msg.content === "string" ? (
            <Slide
              key={index}
              direction="up"
              in
              mountOnEnter
              unmountOnExit
              timeout={300}
            >
              <ListItem
                sx={{
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  my: 1,
                  px: 0,
                }}
              >
                {msg.role === "assistant" && (
                  <ListItemAvatar sx={{ minWidth: "auto", marginRight: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        width: 36,
                        height: 36,
                      }}
                    >
                      <SmartToy fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                )}
                <Box
                  sx={{
                    maxWidth: "75%",
                    px: 2,
                    py: 1,
                    borderRadius:
                      msg.role === "user"
                        ? "20px 20px 5px 20px"
                        : "20px 20px 20px 5px",
                    bgcolor:
                      msg.role === "user"
                        ? theme.palette.action.selected
                        : theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[1],
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    "& h1, & h2, & h3, & h4, & h5, & h6": {
                      mt: 1.5,
                      mb: 1,
                      fontWeight: 600,
                    },
                    "& h1": { fontSize: "1.5rem" },
                    "& h2": { fontSize: "1.3rem" },
                    "& h3": { fontSize: "1.15rem" },
                    "& p": { marginBlock: theme.spacing(0.5, 1) },
                    "& pre": {
                      backgroundColor: "rgba(0,0,0,0.2)",
                      padding: theme.spacing(1, 1.5),
                      borderRadius: theme.shape.borderRadius,
                      overflowX: "auto",
                      fontSize: "0.875em",
                      my: 1,
                    },
                    "& code:not(pre > code)": {
                      fontFamily: "monospace",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      padding: theme.spacing(0.25, 0.75),
                      borderRadius: theme.shape.borderRadius / 2,
                      fontSize: "0.875em",
                    },
                    "& ul, & ol": {
                      mt: 0,
                      mb: theme.spacing(1),
                      pl: theme.spacing(3),
                    },
                    "& li": { mb: theme.spacing(0.5) },
                    "& a": {
                      color: theme.palette.secondary.light,
                      textDecoration: "underline",
                      "&:hover": { color: theme.palette.secondary.main },
                    },
                  }}
                >
                  {msg.content.startsWith("data:image/png;base64,") ? (
                    <img
                      src={msg.content}
                      alt="Generated Content"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        display: "block",
                        borderRadius: "4px",
                        marginTop: "8px",
                      }}
                    />
                  ) : (
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        p: ({ node, ...props }) =>
                          node.children.length === 0 ||
                          (node.children.length === 1 &&
                            node.children[0].type === "text" &&
                            node.children[0].value.trim() === "") ? null : (
                            <p {...props} />
                          ),
                      }}
                    >
                      {msg.content + " "}
                    </ReactMarkdown>
                  )}
                </Box>
                {msg.role === "user" && (
                  <ListItemAvatar sx={{ minWidth: "auto", marginLeft: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.secondary.main,
                        color: theme.palette.secondary.contrastText,
                        width: 36,
                        height: 36,
                      }}
                    >
                      <Person fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                )}
              </ListItem>
            </Slide>
          ) : null
        )}
        {isLoading && (
          <ListItem sx={{ justifyContent: "flex-start", my: 1, px: 0 }}>
            <ListItemAvatar sx={{ minWidth: "auto", marginRight: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  width: 36,
                  height: 36,
                }}
              >
                <SmartToy fontSize="small" />
              </Avatar>
            </ListItemAvatar>
            <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1 }}>
              <CircularProgress
                size={20}
                sx={{ color: theme.palette.text.secondary }}
              />
            </Box>
          </ListItem>
        )}
        <div ref={messagesEndRef} />
      </List>

      {/* --- Input Form BOX - STYLING REVERTED --- */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex" }}>
        {/* --- TextField - STYLING REVERTED --- */}
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Assistant Inteligent Kogo™" // Original placeholder
          disabled={isLoading}
          multiline
          maxRows={4} // Original maxRows
          // Original sx prop for TextField appearance
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2, // Original border radius
              bgcolor: "background.default", // Original background (uses theme)
            },
          }}
          // Original InputProps putting the IconButton inside
          InputProps={{
            endAdornment: (
              // --- IconButton - STYLING REVERTED (and moved back inside InputProps) ---
              <IconButton
                type="submit"
                disabled={isLoading || !input.trim()}
                // Original sx prop for IconButton
                sx={{
                  color: "#18A69B", // Original color
                  "&:hover": { bgcolor: "rgba(24, 166, 155, 0.1)" }, // Original hover
                }}
              >
                <Send />
              </IconButton>
            ),
          }}
          // Remove the onKeyDown handler if you didn't have it before
          // onKeyDown={(e) => {
          //     if (e.key === 'Enter' && !e.shiftKey) {
          //         e.preventDefault();
          //         handleSubmit(e);
          //     }
          // }}
        />
        {/* The external IconButton from the previous version is removed */}
      </Box>
      {/* --- END OF REVERTED FORM STYLING --- */}

      {/* Error Snackbar (remains the same as last working version) */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
