import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  SvgIcon,
} from "@mui/material";
import { CheckOutlined, WarningAmber } from "@mui/icons-material";
import { DeleteOutlined } from "@mui/icons-material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadIcon from '@mui/icons-material/Upload';

const actions = (isLoaded, fileKey) => [
  {
    id: "loaded",
    caption: "Loaded",
    icon: isLoaded ? (
      <CheckOutlined fontSize="small" color="success" />
    ) : (
      <WarningAmber fontSize="small" color="warning" />
    ),
  },
  {
    id: "save",
    caption: "Save",
    icon: isLoaded && (
      <UploadIcon 
        fontSize="small" 
        color={fileKey === "ifc_ifc" ? "success" : "disabled"} 
      />
    ),
  },
  {
    id: "reload",
    caption: "Reload",
    icon: isLoaded && (
      <RestartAltIcon 
        fontSize="small" 
        color={fileKey === "ifc_ifc" ? "disabled" : "warning"} 
      />
    ),
  },
  {
    id: "delete",
    caption: "Supprimer",
    icon: <DeleteOutlined fontSize="small" color="error" />,
  },
];

const icons = {
  ifc: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        fill="#29b6f6"
        d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.99.99 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88zM12 4.15 6.04 7.5 12 10.85l5.96-3.35zM5 15.91l6 3.38v-6.71L5 9.21zm14 0v-6.7l-6 3.37v6.71z"
      />
    </svg>
  ),
  frag: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="12" height="12" x="10" y="2" fill="#42a5f5" rx="6" />
      <rect width="12" height="12" x="18" y="18" fill="#42a5f5" rx="6" />
      <rect width="12" height="12" x="2" y="18" fill="#42a5f5" rx="6" />
      <path
        fill="none"
        stroke="#42a5f5"
        strokeMiterlimit="10"
        strokeWidth="3"
        d="m16 8 8 16M16 8 8 24"
      />
    </svg>
  ),
  json: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
      <path
        fill="#f9a825"
        d="M560-160v-80h120q17 0 28.5-11.5T720-280v-80q0-38 22-69t58-44v-14q-36-13-58-44t-22-69v-80q0-17-11.5-28.5T680-720H560v-80h120q50 0 85 35t35 85v80q0 17 11.5 28.5T840-560h40v160h-40q-17 0-28.5 11.5T800-360v80q0 50-35 85t-85 35zm-280 0q-50 0-85-35t-35-85v-80q0-17-11.5-28.5T120-400H80v-160h40q17 0 28.5-11.5T160-600v-80q0-50 35-85t85-35h120v80H280q-17 0-28.5 11.5T240-680v80q0 38-22 69t-58 44v14q36 13 58 44t22 69v80q0 17 11.5 28.5T280-240h120v80z"
      />
    </svg>
  ),
};

const contentItems = [
  {
    key: "ifc_ifc",
    label: "IFC",
    icon: icons.ifc,
  },
  {
    key: "ifc_fragments_frag",
    label: "Fragments",
    icon: icons.frag,
  },
  {
    key: "ifc_fragments_json",
    label: "Properties",
    icon: icons.json,
  },
  {
    key: "ifc_indexation_json",
    label: "Indexation",
    icon: icons.json,
  },
];

const keys = [
  "ifc_ifc",
  "ifc_fragments_frag",
  "ifc_fragments_json",
  "ifc_indexation_json",
];

export default function CurrentFileViewer({ contents }) {
  if (!contents) return null;

  const handleAction = (key, actionId, basename) => {
    if (key === "ifc_ifc") {
      switch (actionId) {
        case "save":
          console.log("Saving file:", basename);
          break;
        case "reload":
          console.log("Reloading file:", basename);
          break;
        case "delete":
          console.log("Deleting file:", basename);
          break;
        default:
          break;
      }
    }
    if (key === "ifc_fragments_frag") {
      switch (actionId) {
        case "save":
          console.log("Saving file:", basename);
          break;
        case "reload":
          console.log("Reloading file:", basename);
          break;
        case "delete":
          console.log("Deleting file:", basename);
          break;
        default:
          break;
      }
    }
    if (key === "ifc_fragments_json") {
      switch (actionId) {
        case "save":
          console.log("Saving file:", basename);
          break;
        case "reload":
          console.log("Reloading file:", basename);
          break;
        case "delete":
          console.log("Deleting file:", basename);
          break;
        default:
          break;
      }
    }
    if (key === "ifc_indexation_json") {
      switch (actionId) {
        case "save":
          console.log("Saving file:", basename);
          break;
        case "reload":
          console.log("Reloading file:", basename);
          break;
        case "delete":
          console.log("Deleting file:", basename);
          break;
        default:
          break;
      }
    }
  };

  return (
    <List dense>
      {contentItems
        .filter((item) => keys.includes(item.key))
        .map(({ key, label, icon }, index) => {
          const content = contents[key];
          const isLoaded = content?.loaded;

          return (
            <ListItem
              key={key}
              sx={(theme) => ({
                borderTop: index > 0 ? `1px solid ${theme.palette.divider}` : 'none',
                paddingLeft: theme.spacing(2),
              })}
            >
              <ListItemIcon>
                <SvgIcon>{icon}</SvgIcon>
              </ListItemIcon>
              <ListItemText primary={label} />
              <Stack direction="row" spacing={0.5} alignItems="center">
                {actions(isLoaded, key).map((action) => (
                  <IconButton
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent clicks
                      handleAction(key, action.id, label);
                    }}
                    title={action.caption}
                    disabled={(action.id === "save" && key !== "ifc_ifc") || 
                             (action.id === "reload" && key === "ifc_ifc")}
                  >
                    {action.icon}
                  </IconButton>
                ))}
              </Stack>
            </ListItem>
          );
        })}
    </List>
  );
}
