import React from "react";
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ListItemIcon,
  Checkbox,
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

export const Item = (props) => {
  const {
    itemsRef,
    item: { id, item, checked, displayName },
  } = props;

  const handleDelete = () => {
    itemsRef.doc(id).delete();
  };

  const handleChange = (e) => {
    itemsRef.doc(id).set(
      {
        checked: e.target.checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  };

  return (
    <>
      <ListItem>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={checked}
            onChange={handleChange}
            tabIndex={-1}
            disableRipple
            inputProps={{ "aria-label": "checkbox" }}
            color="default"
          />
        </ListItemIcon>
        <ListItemText
          primary={item}
          secondary={
            displayName
              ? `Added by: ${displayName}`
              : checked
              ? "Done"
              : "In Progress"
          }
        />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
            <Delete />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
};
