import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ForumSidebar from "../components/ForumSidebar";
import { createPostApi, getForumByIdApi, getPostByForumId } from "../api/api";

const ForumPage = () => {
  const [group, setGroup] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [postTitle, setPostTitle] = React.useState("");
  const [postDescription, setPostDescription] = React.useState("");
  const { id } = useParams();

  useEffect(() => {
    const fetchForumInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const [forumRes, postsRes] = await Promise.all([
          getForumByIdApi({ forumId: id }),
          getPostByForumId({ forumId: id }),
        ]);

        if (forumRes) {
          setGroup(forumRes.data);
        }

        if (postsRes) {
          setPosts(postsRes.data);
        }
      } catch (err) {
        console.error("Error fetching forum data:", err);
        setError("Failed to load forum information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchForumInfo();
  }, [id]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPostTitle("");
    setPostDescription("");
  };

  const handleCreatePost = async () => {
    if (postTitle && postDescription) {
      try {
        await createPostApi({
          forumId: id,
          userId: "67573a956843e349fae8d810",
          title: postTitle,
          content: postDescription,
        });
        handleCloseDialog();
        const updatedPosts = await getPostByForumId({ forumId: id });
        setPosts(updatedPosts.data);
      } catch (err) {
        console.error("Error creating post:", err);
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6">Đang tải thông tin diễn đàn...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!group) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6">Không tìm thấy diễn đàn.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", position: "relative", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Header />
        <ForumSidebar forumInfo={group} />
        <Box sx={{ padding: 2 }}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Box
                key={post._id}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  padding: 2,
                  marginBottom: 2,
                }}
              >
                <Typography variant="h6">{post.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {post.senderName} - {post.createdAt}
                </Typography>
                <Typography variant="body1">{post.content}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1">Không có bài đăng nào.</Typography>
          )}
        </Box>
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
          onClick={handleOpenDialog}
        >
          <AddIcon />
        </Fab>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Tạo bài đăng mới</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              label="Tiêu đề"
              type="text"
              fullWidth
              variant="outlined"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              id="description"
              label="Mô tả"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleCreatePost} variant="contained">
              Tạo bài đăng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ForumPage;
