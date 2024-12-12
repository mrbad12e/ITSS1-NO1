import React from "react";
import { Box, Typography, Button, Avatar } from "@mui/material";

const PostList = ({ posts }) => {
  return (
    <Box sx={{ padding: "16px" }}>
      {posts?.map((post, index) => (
        <Box
          key={index}
          sx={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "16px",
            padding: "16px",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
          >
            <Avatar>{post.user.charAt(0)}</Avatar>
            <Typography variant="subtitle1" sx={{ marginLeft: "8px" }}>
              {post.user}
            </Typography>
          </Box>
          <Typography variant="body1">{post.content}</Typography>
          <Box sx={{ marginTop: "8px", display: "flex", gap: "8px" }}>
            <Button size="small" variant="outlined">
              Like
            </Button>
            <Button size="small" variant="outlined">
              Reply
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default PostList;
