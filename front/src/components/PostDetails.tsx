import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  CircularProgress,
  Avatar,
  Button,
  TextField,
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import postService from 'services/post.service';
import commentService from 'services/comment.service';
import { Post } from 'interfaces/post.intefaces';
import userService from 'services/user.service';
import { ProfileUser } from 'interfaces/user.intefaces';
import { MovieDetailDialog } from './MovieDetailDialog';
import { useNavigate, useLocation } from 'react-router-dom';

interface Comment {
  _id: string;
  userId: { _id: string; username: string; profilePicture?: string };
  content: string;
  createdAt: string;
}

const postCache = new Map<string, Post>();

interface PostDetailsProps {
  postId: string;
}

const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
  });
};

const PostDetails: React.FC<PostDetailsProps> = ({ postId }) => {
  const [post, setPost] = useState<Post | null>(() => postCache.get(postId) || null);
  const [loading, setLoading] = useState<boolean>(!post); // Only show loading if not in cache
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [openMovieDetail, setOpenMovieDetail] = useState(false);
  const [newComment, setNewComment] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState<string>('');
  const [isLiked, setIsLiked] = useState<boolean | null>(post?.hasLiked ?? null);
  const [userData, setUserData] = useState<ProfileUser>();

  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation(); // Get current route

  // Check if we're on a post detail page
  const isPostDetailPage = location.pathname.startsWith('/posts/');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await userService.getMyProfile();
        setUserData(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (post) return;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPost = await postService.getPostById(postId);
        postCache.set(postId, fetchedPost);
        setPost(fetchedPost);
        setIsLiked(fetchedPost.hasLiked);
      } catch (err) {
        setError('Failed to load post.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, post]);

  const fetchComments = async () => {
    try {
      const fetchedComments = await commentService.getCommentsByPostId(postId);
      setComments(fetchedComments.reverse()); // Newest comments first
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    try {
      if (isLiked) await postService.unlikePost(postId);
      else await postService.likePost(postId);
      setIsLiked(!isLiked);
      const updatedPost = { ...post };
      postCache.set(postId, updatedPost);
      setPost(updatedPost);
    } catch (err) {
      console.error('Failed to update likes', err);
    }
  };

  // Redirect function
  const redirectToPost = () => {
    navigate(`/posts/${postId}`);
  };

  // Helper to render the rating label
  const renderRatingLabel = (rating: number) => {
    if (rating >= 9.5) return '🌟 Extraordinary';
    if (rating >= 8) return '🤩 Excellent';
    if (rating >= 6) return '😊 Good';
    return '😕 Average';
  };

  // Helper function to get the complete profile picture URL
  const getProfilePictureUrl = (path: string | undefined) => {
    // Check if path exists and is a relative path
    if (path && !path.startsWith('http')) {
      return `${import.meta.env.VITE_BACKEND_URL}${path}`;
    }
    return path || '/placeholder-avatar.png'; // Fallback to placeholder if no image
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await commentService.addComment(postId, newComment);
      setNewComment('');

      // Re-fetch comments
      fetchComments();

      // Increase comments count by 1 in the post state
      setPost((prevPost) => {
        if (!prevPost) return prevPost; // If post is null, return as is
        const updatedPost = { ...prevPost, commentsCount: prevPost.commentsCount + 1 };
        postCache.set(postId, updatedPost); // Update cache
        return updatedPost;
      });
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleEditComment = async (commentId: string) => {
    try {
      await commentService.editComment(commentId, editedComment);
      setEditingCommentId(null);
      fetchComments(); // Re-fetch comments after editing
    } catch (err) {
      console.error('Failed to edit comment', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));

      // Decrease comment count in post state
      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        const updatedPost = { ...prevPost, commentsCount: prevPost.commentsCount - 1 };
        postCache.set(postId, updatedPost);
        return updatedPost;
      });
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    post && (
      <Box
        sx={{
          width: '100%',
          bgcolor: '#f5f5f5',
          maxHeight: isPostDetailPage ? 'unset' : '630px',
          overflow: 'hidden', // Ensures content stays within the container
        }}
      >
        <MovieDetailDialog
          open={openMovieDetail}
          onClose={() => setOpenMovieDetail(false)}
          movieId={parseInt(post.movieId)}
        />

        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            overflow: 'auto', // Enables scrolling for content
            background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%)',
            position: 'relative',
            maxWidth: '100%',
            maxHeight: '100%',
            margin: '0 auto',
            padding: '0',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar
              src={getProfilePictureUrl(post.user.profilePicture)}
              alt={post.user.username}
              sx={{
                width: 80,
                height: 80,
                border: '3px solid white',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              }}
            />
            <Box sx={{ ml: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                {post.user.username}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <StarIcon sx={{ color: 'gold', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {post.rating}/10
                </Typography>
                <Typography variant="subtitle1" sx={{ ml: 2 }}>
                  {renderRatingLabel(post.rating)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 3, backgroundColor: 'white' }}>
            <Grid container spacing={3} alignItems="flex-start">
              {/* Left Side - Review Content */}
              <Grid item xs={12} md={9}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  {post.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.7,
                    wordBreak: 'break-word', // Ensures long words break properly
                    overflowWrap: 'anywhere', // Allows breaking on long unbreakable text like URLs
                    maxWidth: '100%', // Prevents the text from exceeding the container width
                    maxHeight: '100px',
                    overflow: 'auto',
                  }}
                >
                  {post.review}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  {post.images.map((image: string, index: React.Key | null | undefined) => (
                    <Grid item xs={4} key={index}>
                      <Box
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          transition: 'transform 0.3s',
                          '&:hover': { transform: 'scale(1.05)' },
                        }}
                      >
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${image}`}
                          alt={`Image ${index}`}
                          style={{ width: '100%', height: 200, objectFit: 'cover' }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {/* Like Button */}
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={handleLike} color="primary">
                    {isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  </IconButton>
                  <Typography variant="body1">
                    {post.hasLiked
                      ? isLiked
                        ? post.likes.length
                        : post.likes.length - 1
                      : isLiked
                        ? post.likes.length + 1
                        : post.likes.length}{' '}
                    {post.likes.length === 1 ? 'Like' : 'Likes'}
                  </Typography>

                  <IconButton onClick={redirectToPost} color="primary">
                    <CommentIcon />
                  </IconButton>
                  <Typography variant="body1">
                    {post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
                  </Typography>
                </Box>
              </Grid>

              {/* Right Side - Movie Quick Info Card */}
              <Grid item xs={12} md={3}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: '#f8f9fa',
                    position: 'sticky',
                    top: 24,
                    maxHeight: '475px',
                  }}
                >
                  <Box
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { '& img': { transform: 'scale(1.03)' } },
                    }}
                    onClick={() => setOpenMovieDetail(true)}
                  >
                    <div
                      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <img
                        src={post.moviePosterURL}
                        alt={post.movieName}
                        style={{
                          maxHeight: '300px',
                          borderRadius: 4,
                          marginBottom: '8px',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </div>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {post.movieName}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      sx={{
                        mt: 2,
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMovieDetail(true);
                      }}
                    >
                      More Details
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Comments Section */}
            {isPostDetailPage && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Write a comment..."
                  variant="outlined"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleAddComment}
                  sx={{ whiteSpace: 'nowrap' }} // Ensures button doesn't shrink
                >
                  Comment
                </Button>
              </Box>
            )}

            {isPostDetailPage && (
              <Box sx={{ mt: 3 }}>
                {comments.map((comment) => (
                  <Paper
                    key={comment._id}
                    sx={{ p: 2, mt: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <Avatar
                      src={getProfilePictureUrl(comment.userId.profilePicture)}
                      alt={comment.userId.username}
                    />
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography fontWeight="bold">{comment.userId.username}</Typography>
                      <Typography variant="caption" sx={{ color: 'gray', ml: 1 }}>
                        {formatTimeAgo(comment.createdAt)}
                      </Typography>

                      {/* Replace comment text with a TextField when editing */}
                      {editingCommentId === comment._id ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          sx={{ mt: 1 }}
                        />
                      ) : (
                        <Typography sx={{ mt: 1 }}>{comment.content}</Typography>
                      )}
                    </Box>

                    {/* Edit & Save Buttons - Only for the comment owner */}
                    {userData && comment.userId._id === userData.id && (
                      <>
                        {editingCommentId === comment._id ? (
                          <>
                            <Button onClick={() => handleEditComment(comment._id)}>Save</Button>
                            <Button onClick={() => setEditingCommentId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <IconButton
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditedComment(comment.content); // Prefill with existing comment
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteComment(comment._id)}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </>
                        )}
                      </>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    )
  );
};

export default PostDetails;
