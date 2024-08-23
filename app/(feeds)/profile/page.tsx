// app/profile/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface UserProfile {
  username: string;
  avatar: string;
  bio: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
}

interface Activity {
  id: string;
  type: 'like' | 'comment';
  postTitle: string;
  date: string;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'activities' | 'saved'>('posts');

  const userProfile: UserProfile = {
    username: 'SupportiveUser123',
    avatar: '/supportive-avatar.jpg',
    bio: 'Advocate for a safer online environment',
  };

  const userPosts: Post[] = [
    { id: '1', title: 'Recognizing online harassment', content: 'Here are some signs to watch out for...' },
    { id: '2', title: 'Supporting abuse survivors', content: 'Ways we can provide meaningful support...' },
  ];

  const userActivities: Activity[] = [
    { id: '1', type: 'like', postTitle: 'Cyberbullying prevention strategies', date: '2023-05-15' },
    { id: '2', type: 'comment', postTitle: 'Resources for domestic abuse victims', date: '2023-05-14' },
  ];

  const savedPosts: Post[] = [
    { id: '3', title: 'Understanding digital consent', content: 'A guide to respecting boundaries online' },
    { id: '4', title: 'Reporting abuse on social media', content: 'Step-by-step instructions for major platforms' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-purple-100">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-purple-800">User Profile</h1>
          <div className="flex items-center space-x-6 mb-8">
            <Image src={userProfile.avatar} alt={userProfile.username} width={120} height={120} className="rounded-full ring-4 ring-purple-200" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{userProfile.username}</h2>
              <p className="text-gray-600 mt-2">{userProfile.bio}</p>
            </div>
          </div>
          
          <div className="flex space-x-4 mb-8">
            {['posts', 'activities', 'saved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'posts' | 'activities' | 'saved')}
                className={`px-6 py-3 rounded-full font-medium transition-colors duration-200 ${
                  activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'posts' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-700">My Posts</h3>
              {userPosts.map(post => (
                <div key={post.id} className="mb-6 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">{post.title}</h4>
                  <p className="text-gray-600">{post.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'activities' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-700">Activities</h3>
              {userActivities.map(activity => (
                <div key={activity.id} className="mb-6 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <p className="text-gray-700">
                    You {activity.type === 'like' ? 'supported' : 'commented on'} the post "{activity.postTitle}" on {activity.date}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-700">Saved Resources</h3>
              {savedPosts.map(post => (
                <div key={post.id} className="mb-6 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">{post.title}</h4>
                  <p className="text-gray-600">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;