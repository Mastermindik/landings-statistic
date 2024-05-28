import { Alert, Button, Fab, Modal, Snackbar, TextField } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";
import "../styles/modal.css";
import { DataType, useAddLanding } from "../hooks/useLandingList";

type Props = {
  open: boolean;
  handleClose: () => void;
  landingsList: DataType[];
};

const LINK = import.meta.env.VITE_LINK;
const LINK_NOT_MY = import.meta.env.VITE_LINK_NOT_MY;
const LINK_FUEL = import.meta.env.VITE_LINK_FUEL;

export default function ModalAddLanding({
  handleClose,
  open,
  landingsList,
}: Props) {
  const [id, setId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showLink, setShowLink] = useState<boolean>(false);
  const { addLanding, isSuccess, setIsSuccess, isError, setIsError } = useAddLanding();

  const copyLink = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Текст скопійовано")
      })
      .catch((e) => alert(e));
  };

  const handleCloseSnackbar = () => {
    setIsSuccess(false);
    setIsError
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <>
        <Snackbar
          open={isSuccess || isError}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={isSuccess ? "success" : "error"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {isSuccess ? "Додано успішно" : "Не додано"}
          </Alert>
        </Snackbar>
        <div className="modal">
          <TextField
            type="number"
            fullWidth
            label="ID"
            value={id}
            disabled={showLink}
            onChange={(e) => setId(e.target.value)}
          />
          <TextField
            type="text"
            fullWidth
            label="Name"
            value={name}
            disabled={showLink}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="contained"
            size="large"
            color={showLink ? "info" : "success"}
            onClick={() => setShowLink((state) => !state)}
            disabled={landingsList.some((e) => e.landingId.toString() === id)}
          >
            {!showLink ? "Згенерувати" : "Редагувати"}
          </Button>
          {showLink && (
            <>
              <div className="copy_link">
                <TextField
                  type="text"
                  className="input"
                  label="ID"
                  value={`;const landingId="${id}";`}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Fab
                  color="primary"
                  onClick={() => copyLink(`;const landingId="${id}";`)}
                >
                  <ContentCopyIcon />
                </Fab>
              </div>
              <div className="copy_link">
                <TextField
                  type="text"
                  className="input"
                  label="Лінк"
                  value={LINK}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Fab color="primary" onClick={() => copyLink(LINK)}>
                  <ContentCopyIcon />
                </Fab>
              </div>
              <div className="copy_link">
                <TextField
                  type="text"
                  className="input"
                  label="Лінк не мій"
                  value={LINK_NOT_MY}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Fab color="primary" onClick={() => copyLink(LINK_NOT_MY)}>
                  <ContentCopyIcon />
                </Fab>
              </div>
              <div className="copy_link">
                <TextField
                  type="text"
                  className="input"
                  label="Лінк паливо"
                  value={LINK_FUEL}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Fab color="primary" onClick={() => copyLink(LINK_FUEL)}>
                  <ContentCopyIcon />
                </Fab>
              </div>
              <Button
                variant="contained"
                size="large"
                color="success"
                onClick={() => addLanding({landingId: +id, landingName: name})}
              >
                Підтвердити
              </Button>
            </>
          )}
        </div>
      </>
    </Modal>
  );
}
