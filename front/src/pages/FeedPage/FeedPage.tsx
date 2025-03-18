import React, { useCallback, useState, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import PostDetails from 'components/PostDetails';
import postService from 'services/post.service';

// Memoized version of PostDetails to avoid unnecessary rerenders
const MemoizedPostDetails = React.memo(PostDetails);

const Feed: React.FC = () => {
  const [postIds, setPostIds] = useState<Map<number, string>>(new Map()); // Use Map to hold index-postId pairs
  const [totalPosts, setTotalPosts] = useState<number | null>(null); // Total number of posts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRanges = useRef<Set<string>>(new Set()); // Track fetched ranges to avoid redundant calls

  // Fetch posts based on startIndex and endIndex
  const fetchPostsInRange = useCallback(async (startIndex: number, endIndex: number) => {
    const rangeKey = `${startIndex}-${endIndex}`;

    if (fetchedRanges.current.has(rangeKey)) return;
    fetchedRanges.current.add(rangeKey);

    try {
      setLoading(true);
      const response = await postService.getPostsInRange(startIndex, endIndex); // API for paginated posts
      const { posts, totalPosts } = response;

      // Use Map to avoid rerendering unchanged rows
      setPostIds((prev) => {
        const newMap = new Map(prev);
        posts.forEach((post, index) => {
          newMap.set(startIndex + index, post._id);
        });
        return newMap;
      });

      setTotalPosts(totalPosts); // Set the total number of posts
    } catch (err) {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch visible posts dynamically based on the range
  const handleItemsRendered = useCallback(
    ({
      overscanStartIndex,
      overscanStopIndex,
    }: {
      overscanStartIndex: number;
      overscanStopIndex: number;
    }) => {
      // Add a buffer to overscan range
      const buffer = 1; // at-least 1
      const startIndex = Math.max(0, overscanStartIndex - buffer);
      const endIndex = overscanStopIndex + buffer;

      // Fetch posts for the range if not already fetched
      fetchPostsInRange(startIndex, endIndex);
    },
    [fetchPostsInRange],
  );

  // Virtualized list row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const postId = postIds.get(index);

    return (
      <div
        style={{
          ...style,
          marginBottom: '20px',
          backgroundColor: postId ? 'transparent' : 'white', // Black background for placeholders
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'background-color 0.2s ease-in-out', // Smooth transition
        }}
      >
        {postId ? (
          <MemoizedPostDetails postId={postId} />
        ) : (
          <div style={{ color: 'white', fontSize: '16px', animation: 'fade-in 0.2s' }}>
            Placeholder Row
          </div>
        )}
      </div>
    );
  };

  if (loading && postIds.size === 0) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <List
      height={window.innerHeight} // Adjust to screen height
      itemCount={totalPosts || 1000} // Use totalPosts for accurate count
      itemSize={650} // Adjust this if necessary for row height
      width="100%"
      overscanCount={5} // Adds 5 extra rows above and below the visible area
      onItemsRendered={handleItemsRendered}
    >
      {({ index, style }) => <Row key={`row-${index}`} index={index} style={style} />}
    </List>
  );
};

export default Feed;
