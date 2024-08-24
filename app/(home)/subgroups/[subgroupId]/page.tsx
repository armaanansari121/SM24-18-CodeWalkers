/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import PostCard from "@/app/_components/PostCard";
import SearchBar from "@/app/_components/SearchBar";
import SubgroupHeader from "@/app/_components/SubgroupHeader";
import { useContract } from "@/app/_contexts/ContractContext";
import { Post, Subgroup } from "@/types";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Web3 from "web3";

export default function SubgroupFeedPage() {
  const params = useParams();
  const subgroupId = Array.isArray(params.subgroupId)
    ? params.subgroupId[0]
    : params.subgroupId;

  const [subgroup, setSubgroup] = useState<Subgroup | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [userExists, setUserExists] = useState<boolean>(false);
  const { contract, account } = useContract();

  useEffect(() => {
    const fetchSubgroupData = async () => {
      try {
        if (contract) {
          const userData = await contract.methods.getUser(account).call();
          setUserExists(userData._exists);
          // console.log(userData);

          const subgroupData = await contract.methods
            .getSubgroup(subgroupId)
            .call();

          if (!subgroupData || !subgroupData._name) {
            console.log("Subgroup data is invalid");
            setError("Subgroup not found");
            return;
          }
          console.log(subgroupData);

          setSubgroup({
            id: subgroupId,
            name: subgroupData._name,
            subscriberCount: parseInt(subgroupData._subscriberCount),
            posts: subgroupData._posts.map((id: string) => parseInt(id)),
          });

          // Fetch posts for this subgroup
          // const postsData = await Promise.all(
          //   subgroupData._posts.map((postId: string) =>
          //     contract.methods.getPost(postId).call()
          //   )
          // );

          // const formattedPosts = postsData.map((post: any, index: number) => ({
          //   id: subgroupData._posts[index],
          //   title: post._title,
          //   description: post._description,
          //   username: "", // You'll need to fetch the username separately
          //   userProfileImage: "", // You'll need to fetch the user's profile image separately
          //   comments: post._comments.map((id: string) => parseInt(id)),
          //   isFollowingAuthor:
          // }));

          // Assuming your contract has a postCount method
          const fetchedPosts: Post[] = [];

          for (let i = 0; i < subgroupData._posts.length; i++) {
            console.log(Number(subgroupData._posts[i]));
            const post = await contract.methods
              .getPost(Number(subgroupData._posts[i]))
              .call(); // Assuming your contract has a getPost method
            // console.log(post);
            const authorData = await contract.methods
              .getUser(post._author)
              .call();
            // console.log(authorData);
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
          setFilteredPosts(fetchedPosts);

          const joined = await contract.methods
            .isSubscribed(Number(subgroupId), account)
            .call();
          console.log(joined);
          setIsJoined(joined);
        }
      } catch (error) {
        console.error("Error fetching subgroup data:", error);
      }
    };

    fetchSubgroupData();
  }, [contract, subgroupId]);

  const handleJoin = async () => {
    if (contract) {
      try {
        await contract.methods.joinSubgroup(subgroupId).send({
          from: account,
        });
        setIsJoined(true);
      } catch (error) {
        console.error("Error joining subgroup:", error);
      }
    }
  };
  const handleLeave = async () => {
    if (contract) {
      try {
        await contract.methods.leaveSubgroup(subgroupId).send({
          from: account,
        });
        setIsJoined(false);
      } catch (error) {
        console.error("Error leaving subgroup:", error);
      }
    }
  };
  const handleSearchResults = (results: Post[]) => {
    setFilteredPosts(results);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!subgroup) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-6 space-y-6">
      <SearchBar posts={posts} onSearchResults={handleSearchResults} />
      <SubgroupHeader
        subgroup={subgroup}
        isJoined={isJoined}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />
      {posts.length > 0 ? (
        posts.map((post: Post) => (
          <PostCard key={post.id} post={post} userExists={userExists} />
        ))
      ) : (
        <p>No posts found in this subgroup.</p>
      )}
    </div>
  );
}
