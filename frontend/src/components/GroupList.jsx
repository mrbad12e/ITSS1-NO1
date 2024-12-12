import React from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchMyForumApi } from "../api/api";
import CircularProgress from "@mui/material/CircularProgress";

const GroupList = () => {
  const [groups, setGroups] = React.useState(null);
  const navigate = useNavigate();

  const fetchMyForum = async () => {
    try {
      const res = await fetchMyForumApi({ userId: "67573a956843e349fae8d810" });
      if (res) {
        console.log(res);
        setGroups(res.data);
      }
    } catch (error) {
      console.error("Error fetching forums:", error);
      setGroups([]);
    }
  };

  React.useEffect(() => {
    fetchMyForum();
  }, []);

  const handleGroupClick = (id) => {
    navigate(`/forum/${id}`);
  };

  return (
    <Grid container spacing={3} sx={{ padding: "20px" }}>
      {groups === null ? (
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      ) : groups.length > 0 ? (
        groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group._id}>
            <Card
              sx={{ cursor: "pointer" }}
              onClick={() => handleGroupClick(group._id)}
            >
              <CardContent>
                <Typography variant="h6">{group.name}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Box sx={{ width: "100%", textAlign: "center", marginTop: "20px" }}>
          <Typography variant="h6" color="textSecondary">
            Bạn chưa có nhóm nào. Hãy tham gia hoặc tạo nhóm mới!
          </Typography>
        </Box>
      )}
    </Grid>
  );
};

export default GroupList;
