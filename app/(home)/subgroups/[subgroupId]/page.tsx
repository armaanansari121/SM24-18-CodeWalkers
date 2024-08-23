"use client";

import PostCard from '@/app/_components/PostCard';
import SearchBar from '@/app/_components/SearchBar';
import SubgroupHeader from '@/app/_components/SubgroupHeader';
import { useContract } from '@/app/_contexts/ContractContext';
import { Post, Subgroup } from '@/types';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Web3 from 'web3';



export default function SubgroupFeedPage() {
  const params = useParams();
  const subgroupId = Array.isArray(params.subgroupId) ? params.subgroupId[0] : params.subgroupId;
  
  const [subgroup, setSubgroup] = useState<Subgroup | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { contract} = useContract();

  useEffect(() => {
    const fetchSubgroupData = async () => {
      
    
      try {
        
        if(contract){
        const subgroupData = await contract.methods.getSubgroup(subgroupId).call();
       
        
        if (!subgroupData || !subgroupData._name) {
          console.log("Subgroup data is invalid");
          setError("Subgroup not found");
          return;
        }

        setSubgroup({
          id: subgroupId,
          name: subgroupData._name,
          subscriberCount: parseInt(subgroupData._subscriberCount),
          posts: subgroupData._posts.map((id: string) => parseInt(id)),
        });

        // Fetch posts for this subgroup
        const postsData = await Promise.all(
          subgroupData._posts.map((postId: string) => contract.methods.getPost(postId).call())
        );

        const formattedPosts = postsData.map((post: any, index: number) => ({
          id: subgroupData._posts[index],
          title: post._title,
          description: post._description,
          username: '', // You'll need to fetch the username separately
          userProfileImage: '', // You'll need to fetch the user's profile image separately
          comments: post._comments.map((id: string) => parseInt(id)),
        }));

        setPosts(formattedPosts);
      }
      } catch (error) {
        console.error('Error fetching subgroup data:', error);
        
      }
    };

    fetchSubgroupData();
  }, [contract, subgroupId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!subgroup) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-6 space-y-6">
      <SearchBar />
      <SubgroupHeader subgroup={subgroup} />
      {posts.length > 0 ? (
        posts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <p>No posts found in this subgroup.</p>
      )}
    </div>
  );
}