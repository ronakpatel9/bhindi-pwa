import React, { useState } from "react";
import {
  Typography,
  Button,
  makeStyles,
  Input,
  Paper,
} from "@material-ui/core";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
}));

export const CreateRoomForm = ({ auth, firestore }) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [formValue, setFormValue] = useState("");
  const roomsRef = firestore.collection("rooms");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    const room = await roomsRef.add({
      name: formValue,
      members: [uid],
      owner: uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setFormValue("");
    if (room)
      enqueueSnackbar("Room created!", {
        variant: "success",
      });
  };

  return (
    <Paper square className={classes.paper}>
      <Typography variant="h6" color="textPrimary">
        New Room
      </Typography>
      <form onSubmit={handleSubmit}>
        <Input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Enter room name..."
          color="secondary"
        />
        <Button
          size="small"
          variant="text"
          color="secondary"
          type="submit"
          disabled={!formValue}
        >
          Create room
        </Button>
      </form>
    </Paper>
  );
};
