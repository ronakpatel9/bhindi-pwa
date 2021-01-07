import React, { useState, useEffect } from "react";

import {
  List,
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

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (user) {
    analytics.logEvent("login", { method: "Google" });
  }

  return (
    <div>
      <header>
        <h1>Bhindi</h1>
        {loading && "Loading..."}
        {user ? <SignOut /> : <SignIn />}
        {user && <InviteForm />}
      </header>
      <section>{user && <RoomPage />}</section>
    </div>
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
  const [formValue, setFormValue] = useState("");
  const [addRoomId, setAddRoomId] = useState(false);
  const roomsRef = firestore.collection("rooms");

  const addRoom = async (e) => {
    e.preventDefault();
    setAddRoomId(true);
  };

  return (
    <>
      <h3>Invite Form</h3>
      <form onSubmit={addRoom}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Enter an chat id..."
        />
        <button type="submit" disabled={!formValue}>
          Add room
        </button>
      </form>
      {addRoomId && formValue && (
        <InviteFormMessage roomsRef={roomsRef} roomId={formValue} />
      )}
    </>
  );
};

const RoomPage = () => {
  const [roomSelect, setRoomSelect] = useState("");
  const { uid } = auth.currentUser;

  const roomsRef = firestore.collection("rooms");

  const query = roomsRef.where("members", "array-contains", uid);
  const [rooms, loading] = useCollectionData(query, { idField: "id" });

  const handleChange = (e) => {
    setRoomSelect(e.target.value);
  };

  return (
    <>
      {loading ? (
        "Loading..."
      ) : (
        <select defaultValue="" onChange={handleChange}>
          <option disabled value="">
            Select an option
          </option>
          {rooms.map((room) => (
            <option value={room.id} key={room.id}>
              {room.name}
            </option>
          ))}
        </select>
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

  const addItem = async (e) => {
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
      <h4>Current room id: {roomId}</h4>
      <form onSubmit={addItem}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Enter an item..."
        />
        <button type="submit" disabled={!formValue}>
          Add item
        </button>
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
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
};

export default App;
