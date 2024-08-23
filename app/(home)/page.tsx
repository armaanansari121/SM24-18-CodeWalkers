"use client";

import { useEffect, useState } from "react";
import { useContract } from "../_contexts/ContractContext"; // Assuming this provides the contract
import { Post } from "../../types";
import PostCard from "../_components/PostCard";
import SearchBar from "../_components/SearchBar";

export default function FeedsPage() {
  const { contract, account } = useContract();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!contract) return;

      try {
        const userData = await contract.methods.getUser(account).call();
        setUserExists(userData._exists);
        console.log("userDta",userData);

        const postCount = await contract.methods.postCount().call(); // Assuming your contract has a postCount method
        const fetchedPosts: Post[] = [];

        for (let i = 1; i <= postCount; i++) {
          const post = await contract.methods.getPost(i).call(); // Assuming your contract has a getPost method
          const authorData = await contract.methods
            .getUser(post._author)
            .call();
          let isFollowing = false;
          for (let i = 0; i < authorData._followers.length; i++) {
            if (authorData._followers[i] == account) {
              isFollowing = true;
              break;
            }
          }
          fetchedPosts.push({
            id: i.toString(),
            username: post._author, // Adjust to match your contract's return structure
            userProfileImage: authorData._imageHash, // Default image or fetched from another source
            title: post._title,
            description: post._description,
            comments: post._comments.map((comment: any) => ({
              username: comment._username, // Adjust based on your contract
              content: comment._content, // Adjust based on your contract
            })),
            // timestamp: post._timestamp, // Adjust based on your contract
            image: post._imageHash || null, // Add this if your posts have images
            isFollowingAuthor: isFollowing,
          });
        }

        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts); // Initialize with all posts
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [contract, account]);

  const handleSearchResults = (results: Post[]) => {
    setFilteredPosts(results);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <SearchBar posts={posts} onSearchResults={handleSearchResults} />
      <div className="mt-6 space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post: Post) => (
            <PostCard key={post.id} post={post} userExists={userExists} />
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </>
  );
}
