import axios from "./axiosCustomize";

const fetchMyForumApi = ({ userId }) => {
  const URL = "/v1/api/forum/my-forums";
  const data = {
    userId,
  };
  return axios.post(URL, data);
};

const createForumApi = ({ name, userId, description }) => {
  const URL = "/v1/api/forum";
  const data = {
    name,
    userId,
    description,
  };
  return axios.post(URL, data);
};

const getForumByIdApi = ({ forumId }) => {
  const URL = "/v1/api/forum/this-forum";
  const data = {
    forumId,
  };
  return axios.post(URL, data);
};

const createPostApi = ({ forumId, userId, title, content }) => {
  const URL = "/v1/api/post/create";
  const data = {
    forumId,
    userId,
    title,
    content,
  };
  return axios.post(URL, data);
};

const getPostByForumId = ({ forumId }) => {
  const URL = "/v1/api/post/forum-post";
  const data = {
    forumId,
  };
  return axios.post(URL, data);
};

export {
  fetchMyForumApi,
  createForumApi,
  getForumByIdApi,
  createPostApi,
  getPostByForumId,
};
