import React, { useState, useEffect } from "react";
import { FormControl, Input, Button, List } from "@material-ui/core";
import Item from "./Item";
import { itemsRef } from "./firebaseConfig";
import firebase from "firebase";

export const Home = () => {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const unsubscribe = itemsRef
      .orderBy("checked", "asc")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const fbItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(fbItems);
      });
    return () => {
      // cleanup;
      unsubscribe();
    };
  }, []);

  const addItem = (event) => {
    event.preventDefault();
    const { serverTimestamp } = firebase.firestore.FieldValue;
    itemsRef.add({
      item: input,
      checked: false,
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  return (
    <div>
      <h1>Bhindi</h1>
      <form autoComplete="off">
        <FormControl>
          <Input
            placeholder="Enter an item..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></Input>
        </FormControl>
        <Button
          variant="outlined"
          type="submit"
          onClick={addItem}
          disabled={!input}
        >
          Add Item
        </Button>
      </form>
      <List>
        {items.map((item) => (
          <Item item={item} key={item.id} />
        ))}
      </List>
    </div>
  );
};

