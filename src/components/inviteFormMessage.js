import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useDocumentData } from "react-firebase-hooks/firestore";

import { useSnackbar } from "notistack";

export const InviteFormMessage = ({ roomsRef, roomId, auth }) => {
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
