import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ListItemIcon,
  Checkbox,
} from "@material-ui/core";
import React from "react";
import { Delete } from "@material-ui/icons";
import { itemsRef } from "./firebaseConfig";

const Item = (props) => {
  const {
    item: { id, item, checked },
  } = props;

  const handleDelete = () => {
    itemsRef.doc(id).delete();
  };

  const handleChange = (event) => {
    itemsRef.doc(id).set({ checked: event.target.checked }, { merge: true });
  };

  return (
    <ListItem>
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={checked}
          onChange={handleChange}
          tabIndex={-1}
          disableRipple
          inputProps={{ "aria-label": "checkbox" }}
        />
      </ListItemIcon>
      <ListItemText
        primary={item}
        secondary={checked ? "Done" : "In Progress"}
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
          <Delete />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default Item;
