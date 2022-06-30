const getPostsWithStatusAndTotalLikes = (posts, userId) => {
  let allPosts = [];
  for (const post of posts) {
    let statusLike = false;
    for (const like of post.postLikes) {
      if (like.userId == userId) {
        statusLike = true;
      }
    }
    const totalLikes = Object.keys(post.postLikes).length;
    allPosts.push({ ...post._previousDataValues, statusLike, totalLikes });
  }
  return allPosts;
};

module.exports = { getPostsWithStatusAndTotalLikes };
