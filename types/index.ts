// types/index.ts
export interface Post {
    id: string;
    username: string;
    userProfileImage: string;
    title: string;
    description: string;
    image?: string;
    comments: Comment[];
  }
  
  export interface Comment {
    username: string;
    content: string;
  }