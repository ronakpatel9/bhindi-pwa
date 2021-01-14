import React, { useState } from "react";
import {
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  Button,
  makeStyles,
  CircularProgress,
  Grid,
  Tooltip,
} from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useAuthState } from "react-firebase-hooks/auth";

import { CopyToClipBoard } from "./components/copyToClipboard";
import { CreateRoomForm } from "./components/createFormRoom";
import { InviteForm } from "./components/inviteForm";
import { SelectRoom } from "./components/selectRoom";
import { RoomPage } from "./components/roomPage";

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
    console.error("failed due to multi tab");
  } else if (err.code === "unimplemented") {
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
    padding: theme.spacing(2),
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
    <>
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
                  auth={auth}
                  firestore={firestore}
                  roomSelect={roomSelect}
                  setRoomSelect={setRoomSelect}
                />
              )}
              {user && <CopyToClipBoard roomSelect={roomSelect} />}
              {user ? <SignOut /> : <SignIn />}
            </Toolbar>
          </AppBar>
          {user && (
            <Grid container align="center" justify="center">
              <Grid item sm={6} xs={12}>
                <InviteForm auth={auth} firestore={firestore} />
              </Grid>
              <Grid item sm={6} xs={12}>
                <CreateRoomForm auth={auth} firestore={firestore} />
              </Grid>
              <Grid item xs={12}>
                {user && (
                  <RoomPage
                    auth={auth}
                    firestore={firestore}
                    roomSelect={roomSelect}
                  />
                )}
              </Grid>
            </Grid>
          )}
        </>
      )}
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
