import React, { useState } from "react";
import {
  List,
  Button,
  CircularProgress,
  Input,
  Divider,
} from "@material-ui/core";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import {
  useCollectionData,
  useDocumentOnce,
} from "react-firebase-hooks/firestore";

import { Item } from "./item";

export const ListPage = ({ auth, firestore, roomId }) => {
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
