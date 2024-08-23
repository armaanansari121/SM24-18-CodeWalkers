/* eslint-disable react/no-unescaped-entities */
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">User Profile</h1>
          <div className="flex items-center space-x-6 mb-8">
            <Image src={userProfile.avatar} alt={userProfile.username} width={120} height={120} className="rounded-full ring-4 ring-orange-200" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{userProfile.username}</h2>
              {/* <p className="text-gray-600 mt-2">{userProfile.bio}</p> */}
            </div>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex">
              {['posts', 'activities', 'saved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'posts' | 'activities' | 'saved')}
                  className={`px-4 py-4 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">My Posts</h2>
                {userPosts.map(post => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                    <h3 className="text-base font-semibold text-gray-900">{post.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{post.content}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Activities</h2>
                {userActivities.map(activity => (
                  <div key={activity.id} className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                    <p className="text-sm text-gray-500">
                    You {activity.type === 'like' ? 'supported' : 'commented on'} the post "{activity.postTitle}" on {activity.date}
                    </p>
                  </div>
                ))}
              </div>  
            )}

            {activeTab === 'saved' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Saved Resources</h2>
                {savedPosts.map(post => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                    <h3 className="text-base font-semibold text-gray-900">{post.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProfilePage;