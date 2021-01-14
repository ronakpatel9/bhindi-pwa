import React from "react";
import { FormControl, Select, MenuItem } from "@material-ui/core";

import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useCollectionData } from "react-firebase-hooks/firestore";

export const SelectRoom = ({ firestore, auth, roomSelect, setRoomSelect }) => {
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
