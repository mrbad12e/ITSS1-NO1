import React from "react";
import { Box, IconButton, Typography, Stack, Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const ForumSidebar = ({ forumInfo }) => {
  return (
    <Box
      sx={{
        padding: "16px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {forumInfo?.name}
        </Typography>
        <Box>
          <Button
            variant="contained"
            sx={{ marginRight: "8px", backgroundColor: "#3f51b5" }}
          >
            Bài đăng
          </Button>
          <Button variant="outlined" sx={{ color: "#3f51b5" }}>
            Tệp
          </Button>
          <IconButton>
            <HelpOutlineIcon sx={{ color: "#3f51b5" }} />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
};

export default ForumSidebar;
