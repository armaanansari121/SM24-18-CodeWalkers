// app/feeds/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useContract } from '../_contexts/ContractContext'; // Assuming this provides the contract
import { Post } from '../../types';
import PostCard from '../_components/PostCard';
import SearchBar from '../_components/SearchBar';

export default function FeedsPage() {
  const { contract } = useContract();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!contract) return;

      try {
        const postCount = await contract.methods.postCount().call(); // Assuming your contract has a postCount method
        const fetchedPosts: Post[] = [];

        for (let i = 1; i <= postCount; i++) {
          const post = await contract.methods.getPost(i).call(); // Assuming your contract has a getPost method

          fetchedPosts.push({
            id: i.toString(),
            username: post._author, // Adjust to match your contract's return structure
            userProfileImage: '/defaultProfile.png', // Default image or fetched from another source
            title: post._title,
            description: post._description,
            comments: post._comments.map((comment: any) => ({
              username: comment._username, // Adjust based on your contract
              content: comment._content,  // Adjust based on your contract
            })),
            // timestamp: post._timestamp, // Adjust based on your contract
            image: post._image || null, // Add this if your posts have images
          });
        }

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [contract]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-6 space-y-6">
      <SearchBar />
      {posts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
