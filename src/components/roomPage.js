import { ListPage } from "./listPage";

export const RoomPage = ({ auth, firestore, roomSelect }) => {
  return roomSelect ? (
    <ListPage auth={auth} firestore={firestore} roomId={roomSelect} />
  ) : null;
};
