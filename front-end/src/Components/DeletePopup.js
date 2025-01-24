import React from 'react';

const DeletePopup = ({ onClose, onDelete, itemId }) => {

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <div style={{ display: "flex", flexDirection: "column-reverse" }}>
          <button className="exit-popbutton" onClick={onClose}>
            <svg height="20px" viewBox="0 0 384 512">
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
            </svg>
          </button>
        </div>
        <p className="card-heading">Delete file?</p>
        <p className="card-description">
          Do you really want to delete these records? This process cannot be undone.
        </p>
        <div className="card-button-wrapper">
          <button className="card-button secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="card-button primary"
            onClick={() => onDelete(itemId)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  popup: {
    background: "#fff",
    padding: "20px",
    width: "250px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
};

export default DeletePopup;
