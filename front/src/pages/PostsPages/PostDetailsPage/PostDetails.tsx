import React from 'react';
import { useParams } from 'react-router-dom';
import PostDetails from 'components/PostDetails';

const PostDetailsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();

  return (
    postId && <PostDetails postId={postId}/>
  );
};

export default PostDetailsPage;
