import { Button, Fab, Modal, TextField } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";
import "../styles/modal.css";
import { useAddLanding } from "../hooks/useLandingList";
import { current } from "../constatns";


type Props = {
  open: boolean;
  handleClose: () => void;
};

const LINK = import.meta.env.VITE_LINK;
const LINK_NOT_MY = import.meta.env.VITE_LINK_NOT_MY;
const LINK_FUEL = import.meta.env.VITE_LINK_FUEL;

export default function ModalAddLanding({ handleClose, open }: Props) {
  
  const [id, setId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showLink, setShowLink] = useState<boolean>(false);
  const { addLanding } = useAddLanding();

  const copyLink = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => console.log("Текст скопійовано"))
      .catch((e) => console.log(e));
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="modal">
      <button onClick={() => {
        current.map(async e => await addLanding({landingId: e.id, landingName: e.name}))
      }} >aaaaaaaaa</button>
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
    </Modal>
  );
}
