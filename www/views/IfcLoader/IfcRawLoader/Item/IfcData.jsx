import React, { useState } from "react";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Divider, ListItemButton, Collapse, Typography } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

function PropertyList({ properties }) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  if (!properties || properties.length === 0) return null;

  return (
    <List dense>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
        <ListItemText
          primary={<Typography variant="body2">Properties:</Typography>}
        />
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {properties.map((prop) => {
          const name = prop?.Name?.value;
          const value = prop?.NominalValue?.value || "-";
          const expressId = prop?.expressID;

          return (
            <React.Fragment key={`${expressId}_properties`}>
              <Divider variant="inset" component="li" />
              <ListItem
                key={expressId}
                secondaryAction={<ListItemText primary={value} />}
              >
                <ListItemIcon />
                <ListItemText primary={name} />
              </ListItem>
            </React.Fragment>
          );
        })}
      </Collapse>
    </List>
  );
}

function QuantitiesList({ quantities }) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  if (!quantities || quantities.length === 0) return null;

  return (
    <List dense>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
        <ListItemText
          primary={<Typography variant="body2">Quantities:</Typography>}
        />
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {quantities.map((qty) => {
          const name = qty?.Name?.value;
          const expressId = qty?.expressID;
          const lengthValue = qty?.LengthValue?.value || "";
          const unit = qty?.Unit?.value || "";

          return (
            <React.Fragment key={`${expressId}_quantities`}>
              <Divider variant="inset" component="li" />
              <ListItem
                key={expressId}
                secondaryAction={
                  <ListItemText primary={`${lengthValue} ${unit}`} />
                }
              >
                <ListItemIcon />
                <ListItemText primary={name} />
              </ListItem>
            </React.Fragment>
          );
        })}
      </Collapse>
    </List>
  );
}

function PsetList({ pset }) {
  const psetName = pset?.Name?.value;
  const resolvedProperties = pset?.ResolvedHasProperties || [];
  const resolvedQuantities = pset?.ResolvedQuantities || [];
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List dense>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
        <ListItemText primary={psetName} />
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {resolvedProperties.length > 0 && (
          <PropertyList properties={resolvedProperties} />
        )}

        {resolvedQuantities.length > 0 && (
          <QuantitiesList quantities={resolvedQuantities} />
        )}
      </Collapse>
    </List>
  );
}

function MainItemList({ itemData }) {
  const mainProperty = itemData.mainProperty;
  const globalId = mainProperty?.GlobalId?.value;
  const expressId = mainProperty?.expressID;
  const name = mainProperty?.LongName?.value;
  const psets = itemData.psets || [];
  const [open, setOpen] = useState(true); // Default to expanded
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List dense>
      <ListItemButton
        onClick={handleClick}
        sx={(theme) => ({
          ...(open && {
            backgroundColor: theme.palette.background.paper,
          }),
        })}
      >
        <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" color="text.primary">
              {name}
            </Typography>
          }
          secondary={`Psets: ${psets.length}`}
        />
        <ListItemText
          primary={`GlobalId: ${globalId}`}
          secondary={`expressID: ${expressId}`}
        />
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {psets.map((pset) => (
          <PsetList key={`${pset.expressID}_psets`} pset={pset} />
        ))}
      </Collapse>
    </List>
  );
}

export default function IfcDataViewer({ data }) {
  const entries = Object.values(data);

  return (
    <>
      {entries.map((itemsArray, index) => (
        <React.Fragment key={index}>
          {itemsArray.map((item) => (
            <MainItemList
              key={`${item.mainProperty?.expressID}_fragments`}
              itemData={item}
            />
          ))}
        </React.Fragment>
      ))}
    </>
  );
}
