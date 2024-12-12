import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  IconButton,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#3f51b5" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6">TeachNetVN</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SearchIcon />
            <TextField
              placeholder="検索..."
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: "#fff",
                borderRadius: "4px",
              }}
            />
          </Box>
          <IconButton>
            <Avatar alt="Profile" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
