// app/feeds/page.tsx
import PostCard from '../_components/PostCard';
import { Post } from '../../types';
import SearchBar from '../_components/SearchBar';

async function getPosts() {
  // This is where you'd fetch posts from your API or smart contract
  // For now, we'll return mock data
  return [
    {
      id: '1',
      username: 'user1',
      userProfileImage: '/user1.jpg',
      title: 'First Post',
      description: 'This is the first post',
      comments: [],
    },
    {
      id: '1',
      username: 'user4',
      userProfileImage: '/user1.jpg',
      title: 'First Post',
      description: 'This is the first post',
      comments: [],
    },
    {
      id: '1',
      username: 'user2',
      userProfileImage: '/user1.jpg',
      title: 'First Post',
      description: 'This is the first post',
      comments: [],
    },
    // ... more posts
  ];
}

export default async function FeedsPage() {
  const posts = await getPosts();

  return (
    <div className="mt-6 space-y-6">
      <div className=''>
        <SearchBar/>

      </div>
      {posts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}