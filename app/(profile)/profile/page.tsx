/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useContract } from "../../_contexts/ContractContext";
import CreateProfileModal from "../../_components/CreateUserModal";

interface UserProfile {
  imageHash: string;
  username: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  likeCount: number;
  imageHash: string;
}

interface SavedPost {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  author: string;
  likeCount: number;
  imageHash: string;
}

interface Activity {
  id: string;
  content: string;
  postTitle: string;
  postAuthor: string;
  date: string;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "saved">(
    "posts"
  );
  const { contract, account } = useContract();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userActivities, setUserActivities] = useState<Activity[]>([]);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [userExists, setUserExists] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetching user data function
  const fetchUserData = async () => {
    if (contract && account) {
      try {
        const userData = await contract.methods.getUser(account).call();
        const { _exists, _userPosts, _userComments, _savedPosts, _imageHash } =
          userData;

        setUserExists(_exists);

        if (_exists) {
          setUserProfile({
            imageHash: _imageHash,
            username: account, // Replace with actual username if available
          });

          await fetchUserPosts(_userPosts); // Unchanged function
          await fetchUserActivities(_userComments); // Unchanged function
          await fetchSavedPosts(_savedPosts); // Newly added function call
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  // Fetch user posts function
  const fetchUserPosts = async (postIds: string[]): Promise<Post[]> => {
    const posts: Post[] = [];

    for (const postId of postIds) {
      const postData = await contract.methods.getPost(postId).call();
      if (!postData._isDeleted) {
        posts.push({
          id: postId,
          title: postData._title,
          description: postData._description,
          timestamp: new Date(
            Number(postData._timestamp) * 1000
          ).toLocaleString(),
          likeCount: postData._likeCount,
          imageHash: postData._imageHash,
        });
      }
    }
    setUserPosts(posts);
    return posts;
  };

  // Fetch user activities function
  const fetchUserActivities = async (
    commentIds: string[]
  ): Promise<Activity[]> => {
    const activities: Activity[] = [];

    for (const commentId of commentIds) {
      const commentData = await contract.methods.comments(commentId).call();
      if (!commentData.isDeleted) {
        const postData = await contract.methods
          .getPost(commentData.postId)
          .call();
        // const postTitle = `Post related to comment ${commentId}`; // Fetch the actual post title if necessary
        activities.push({
          id: commentId,
          content: commentData.content,
          postTitle: postData._title,
          postAuthor: postData._author,
          date: new Date(Number(commentData.timestamp) * 1000).toLocaleString(),
        });
      }
    }
    setUserActivities(activities);
    return activities;
  };

  // Placeholder for fetching saved posts
  const fetchSavedPosts = async (postIds: string[]): Promise<SavedPost[]> => {
    const posts = [];
    for (const postId of postIds) {
      const postData = await contract.methods.getPost(postId).call();
      if (postData._isDeleted) continue; // Skip deleted posts
      posts.push({
        id: postId,
        title: postData._title,
        timestamp: new Date(
          Number(postData._timestamp) * 1000
        ).toLocaleString(),
        description: postData._description,
        author: postData._author,
        likeCount: postData._likeCount,
        imageHash: postData._imageHash,
      });
    }
    setSavedPosts(posts); // Setting state for saved posts
    return posts;
  };

  useEffect(() => {
    fetchUserData();
  }, [contract, account]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-8">
            {userExists ? (
              <>
                <h1 className="text-3xl font-bold mb-6 text-gray-900">
                  User Profile
                </h1>
                <div className="flex items-center space-x-6 mb-8">
                  <Image
                    src={userProfile?.avatar || "/default-avatar.jpg"}
                    alt={userProfile?.username || account}
                    width={120}
                    height={120}
                    className="rounded-full ring-4 ring-orange-200"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {userProfile?.username || account}
                    </h2>
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <nav className="flex">
                    {["posts", "comments", "saved"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() =>
                          setActiveTab(tab as "posts" | "comments" | "saved")
                        }
                        className={`px-4 py-4 text-sm font-medium ${
                          activeTab === tab
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6 sm:p-8">
                  {activeTab === "posts" && (
                    <div className="space-y-6">
                      <h2 className="text-lg font-medium text-gray-900">
                        My Posts
                      </h2>
                      {userPosts.length > 0 ? (
                        userPosts.map((post) => (
                          <div
                            key={post.id}
                            className="bg-white border border-gray-200 rounded-md shadow-sm p-4"
                          >
                            <h3 className="text-base font-semibold text-gray-900">
                              {post.title}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                              {post.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {post.timestamp}
                            </p>
                            <div className="flex">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="red"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              <span className="ml-1 text-sm text-gray-500">
                                {Number(post.likeCount)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          You don't have any posts yet.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "comments" && (
                    <div className="space-y-6">
                      <h2 className="text-lg font-medium text-gray-900">
                        Comments
                      </h2>
                      {userActivities.length > 0 ? (
                        userActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="bg-white border border-gray-200 rounded-md shadow-sm p-4"
                          >
                            <p className="text-lg text-black">
                              {activity.postTitle}
                            </p>
                            <p className="text-base text-black">
                              {activity.postAuthor}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.content}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.date}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          You don't have any recent comments.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "saved" && (
                    <div className="space-y-6">
                      <h2 className="text-lg font-medium text-gray-900">
                        Saved Resources
                      </h2>
                      {savedPosts.length > 0 ? (
                        savedPosts.map((post) => (
                          <div
                            key={post.id}
                            className="bg-white border border-gray-200 rounded-md shadow-sm p-4"
                          >
                            <p className="text-lg text-black">{post.title}</p>
                            <p className="text-base text-black">
                              {post.author}
                            </p>
                            <p className="text-sm text-gray-500">
                              {post.description}
                            </p>
                            <div className="flex">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="red"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              <span className="ml-1 text-sm text-gray-500">
                                {Number(post.likeCount)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          You don't have any saved posts.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Welcome, {account}
                </h2>
                <p className="text-gray-500 mt-4">
                  It looks like you don't have a profile yet.
                </p>
                <button
                  className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md"
                  onClick={() => setShowModal(true)}
                >
                  Create Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile creation modal */}
      {showModal && (
        <CreateProfileModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={() => {}}
        />
      )}
    </div>
  );
};

export default ProfilePage;
