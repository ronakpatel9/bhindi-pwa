import React, { useState } from "react";
import {
  Typography,
  Button,
  makeStyles,
  Input,
  Paper,
} from "@material-ui/core";

import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { InviteFormMessage } from "./inviteFormMessage";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
}));

export const InviteForm = ({ firestore, auth }) => {
  const classes = useStyles();
  const [formValue, setFormValue] = useState("");
  const [addRoomId, setAddRoomId] = useState(false);
  const roomsRef = firestore.collection("rooms");

  const addRoom = async (e) => {
    e.preventDefault();
    setAddRoomId(true);
  };

  return (
    <Paper square className={classes.paper}>
      <Typography variant="h6">Invite</Typography>
      <form onSubmit={addRoom}>
        <Input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          color="secondary"
          placeholder="Enter the room id..."
        />
        <Button
          size="small"
          variant="text"
          color="secondary"
          type="submit"
          disabled={!formValue}
        >
          Add room
        </Button>
      </form>
      {addRoomId && formValue && (
        <InviteFormMessage roomsRef={roomsRef} roomId={formValue} auth={auth} />
      )}
    </Paper>
  );
};
