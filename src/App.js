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
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";

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
  root: {},
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

  if (user) {
    analytics.logEvent("login", { method: "Google" });
  }

  return (
    <div>
      {loading ? (
        <Grid container justify="center" alignItems="center" direction="column">
          <Grid item>
            <CircularProgress />
          </Grid>
        </Grid>
      ) : (
        <>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h5" className={classes.title}>
                Bhindi
              </Typography>
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
                {user && <RoomPage />}
              </Grid>
            </Grid>
          )}
        </>
      )}
    </div>
  );
};

const CreateRoomForm = () => {
  const classes = useStyles();

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
    if (room) alert("Room created!");
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
        />
        <Button
          size="small"
          variant="text"
          color="primary"
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
  const [roomDoc, loading] = useDocumentData(roomsRef.doc(roomId));

  const { uid } = auth.currentUser;

  if (roomDoc && uid) {
    roomsRef.doc(roomId).update({
      members: firebase.firestore.FieldValue.arrayUnion(uid),
    });
  }

  return loading
    ? "Loading room..."
    : roomDoc
    ? `Room ${roomDoc.name} added please select the room from dropdown below`
    : "No room found";
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
          placeholder="Enter the room id..."
        />
        <Button
          size="small"
          variant="text"
          color="primary"
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

const RoomPage = () => {
  const classes = useStyles();

  const [roomSelect, setRoomSelect] = useState("");
  const { uid } = auth.currentUser;

  const roomsRef = firestore.collection("rooms");

  const query = roomsRef.where("members", "array-contains", uid);
  const [rooms] = useCollectionData(query, { idField: "id" });

  const handleChange = (e) => {
    setRoomSelect(e.target.value);
  };

  return (
    <>
      {rooms && (
        <Paper square className={classes.paper}>
          <Typography variant="h6" color="textPrimary">
            View Room
          </Typography>
          <FormControl>
            <Select
              displayEmpty
              fullWidth
              onChange={handleChange}
              value={roomSelect}
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
        </Paper>
      )}

      {roomSelect && <ListPage roomId={roomSelect} />}
    </>
  );
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
      <Button
        size="small"
        variant="text"
        color="secondary"
        onClick={() => navigator.clipboard.writeText(roomId)}
      >
        Copy room id
      </Button>
      <form onSubmit={handleSubmit}>
        <Input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Enter an item..."
        />
        <Button
          size="small"
          variant="text"
          color="primary"
          type="submit"
          disabled={!formValue}
        >
          Add item
        </Button>
      </form>
      {loading ? (
        "Loading..."
      ) : (
        <List>
          {items &&
            items.map((item) => (
              <Item itemsRef={itemsRef} item={item} key={item.id} />
            ))}
        </List>
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
      <Button color="inherit" onClick={() => auth.signOut()}>
        Sign Out
      </Button>
    )
  );
};

export default App;
