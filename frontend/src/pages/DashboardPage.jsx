import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import GroupList from "../components/GroupList";

const DashboardPage = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Header />
        <GroupList />
      </Box>
    </Box>
  );
};

export default DashboardPage;
