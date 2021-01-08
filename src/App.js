import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ListItemIcon,
  Checkbox,
  AppBar,
  Toolbar,
  Typography,
  Button,
  makeStyles,
  CircularProgress,
  Grid,
  FormControl,
  Select,
  Input,
  Paper,
  MenuItem,
  Divider,
  Tooltip,
} from "@material-ui/core";
import { Delete, ExitToApp, FileCopy } from "@material-ui/icons";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import {
  useCollectionData,
  useDocumentData,
  useDocumentOnce,
} from "react-firebase-hooks/firestore";

import { useSnackbar } from "notistack";

firebase.initializeApp({
  apiKey: "AIzaSyAaxBxClGHAVHAMZXzZFwR10QLuVubesVU",
  authDomain: "bhindi-82dec.firebaseapp.com",
  projectId: "bhindi-82dec",
  storageBucket: "bhindi-82dec.appspot.com",
  messagingSenderId: "763195742769",
  appId: "1:763195742769:web:8bde9a8c4626e6f0e25310",
  measurementId: "G-RMNSW7C04M",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

firestore.enablePersistence().catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a a time.
    // ...
    console.error("failed due to multi tab");
  } else if (err.code === "unimplemented") {
    // The current browser does not support all of the
    // features required to enable persistence
    // ...
    console.error("failed not implemented");
  }
});

const useStyles = makeStyles((theme) => ({
  root: { margin: "5px" },
  loginButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    padding: "5px",
  },
}));

const App = () => {
  const classes = useStyles();
  const [user, loading] = useAuthState(auth);

  const [roomSelect, setRoomSelect] = useState("");

  if (user) {
    analytics.logEvent("login", { method: "Google" });
  }

  return (
    <div>
      {loading ? (
        <Grid container justify="center" alignItems="center" direction="column">
          <Grid item>
            <CircularProgress color="secondary" />
          </Grid>
        </Grid>
      ) : (
        <>
          <AppBar position="static" color="secondary">
            <Toolbar>
              <Typography variant="h5" className={classes.title}>
                Bhindi
              </Typography>
              {user && (
                <SelectRoom
                  roomSelect={roomSelect}
                  setRoomSelect={setRoomSelect}
                />
              )}
              {user && <CopyToClipBoard roomSelect={roomSelect} />}
              {user ? <SignOut /> : <SignIn />}
            </Toolbar>
          </AppBar>
          {user && (
            <Grid container spacing={1} align="center" justify="center">
              <Grid item sm={6} xs={12}>
                <InviteForm />
              </Grid>
              <Grid item sm={6} xs={12}>
                <CreateRoomForm />
              </Grid>
              <Grid item xs={12}>
                {user && <RoomPage roomSelect={roomSelect} />}
              </Grid>
            </Grid>
          )}
        </>
      )}
    </div>
  );
};

const CopyToClipBoard = ({ roomSelect }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(roomSelect);
    enqueueSnackbar("Room ID has been copied to clipboard.", {
      variant: "info",
    });
  };
  return roomSelect ? (
    <Tooltip title="Copy chat id">
      <IconButton size="small" onClick={handleCopyToClipboard}>
        <FileCopy />
      </IconButton>
    </Tooltip>
  ) : null;
};

const CreateRoomForm = () => {
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

const InviteFormMessage = ({ roomsRef, roomId }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [roomDoc, loading] = useDocumentData(roomsRef.doc(roomId));

  const { uid } = auth.currentUser;

  if (roomDoc && uid) {
    roomsRef.doc(roomId).update({
      members: firebase.firestore.FieldValue.arrayUnion(uid),
    });
    enqueueSnackbar(`Room added with name: ${roomDoc.name}. added.`, {
      variant: "success",
    });
  } else {
    !loading && enqueueSnackbar(`No room found.`, { variant: "error" });
  }

  return loading && "Loading room...";
};

const InviteForm = () => {
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
        <InviteFormMessage roomsRef={roomsRef} roomId={formValue} />
      )}
    </Paper>
  );
};

const SelectRoom = ({ roomSelect, setRoomSelect }) => {
  const { uid } = auth.currentUser;

  const roomsRef = firestore.collection("rooms");

  const query = roomsRef.where("members", "array-contains", uid);
  const [rooms] = useCollectionData(query, { idField: "id" });

  const handleChange = (e) => {
    setRoomSelect(e.target.value);
  };

  return rooms ? (
    <FormControl>
      <Select
        displayEmpty
        onChange={handleChange}
        value={roomSelect}
        color="secondary"
        autoWidth
      >
        <MenuItem disabled value="">
          Select a room
        </MenuItem>
        {rooms.map((room) => (
          <MenuItem value={room.id} key={room.id}>
            {room.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : null;
};

const RoomPage = ({ roomSelect }) => {
  return roomSelect ? <ListPage roomId={roomSelect} /> : null;
};

const ListPage = ({ roomId }) => {
  const itemsRef = firestore.doc(`rooms/${roomId}`).collection("items");
  const query = itemsRef.orderBy("checked", "asc").orderBy("createdAt", "desc");
  const [items, loading] = useCollectionData(query, { idField: "id" });

  const { uid, displayName, email, photoURL } = auth.currentUser;

  const usersRef = firestore.collection("users");
  const [userDoc] = useDocumentOnce(usersRef.doc(uid));

  if (userDoc && !userDoc.exists) {
    usersRef.doc(uid).set({
      displayName,
      email,
      photoURL,
    });
  }

  const [formValue, setFormValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await itemsRef.add({
      item: formValue,
      checked: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
    });

    setFormValue("");
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <Input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          color="secondary"
          fullWidth
          placeholder="Enter an item..."
        />
        <Button
          size="small"
          variant="text"
          color="secondary"
          type="submit"
          disabled={!formValue}
        >
          Add item
        </Button>
      </form>
      {loading ? (
        <CircularProgress color="secondary" />
      ) : (
        <>
          <List>
            {items &&
              items
                .filter((item) => !item.checked)
                .map((item) => (
                  <Item itemsRef={itemsRef} item={item} key={item.id} />
                ))}
          </List>
          <Divider />
          <List>
            {items &&
              items
                .filter((item) => item.checked)
                .map((item) => (
                  <Item itemsRef={itemsRef} item={item} key={item.id} />
                ))}
          </List>
        </>
      )}
    </>
  );
};

const Item = (props) => {
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

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <Button color="inherit" onClick={signInWithGoogle}>
        Sign in with Google
      </Button>
    </>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && (
      <Tooltip title="Sign out">
        <IconButton size="small" color="inherit" onClick={() => auth.signOut()}>
          <ExitToApp />
        </IconButton>
      </Tooltip>
    )
  );
};

export default App;
