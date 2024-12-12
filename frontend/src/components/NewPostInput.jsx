import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

const NewPostInput = ({ onSubmit }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <Box
      sx={{
        padding: "16px",
        borderTop: "1px solid #ddd",
        backgroundColor: "#f5f5f5",
        display: "flex",
        gap: "8px",
      }}
    >
      <TextField
        fullWidth
        placeholder="Write a new post or comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        variant="outlined"
        size="small"
      />
      <Button variant="contained" onClick={handleSubmit}>
        Send
      </Button>
    </Box>
  );
};

export default NewPostInput;
