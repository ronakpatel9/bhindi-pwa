import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { FileCopy } from "@material-ui/icons";

import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useSnackbar } from "notistack";

export const CopyToClipBoard = ({ roomSelect }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(roomSelect);
    enqueueSnackbar("Room ID has been copied to clipboard.", {
      variant: "info",
    });
  };
  return roomSelect ? (
    <Tooltip title="Copy Chat ID">
      <IconButton size="small" onClick={handleCopyToClipboard}>
        <FileCopy />
      </IconButton>
    </Tooltip>
  ) : null;
};
