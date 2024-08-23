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

  export interface Subgroup {
    id: string;
    name: string;
    subscriberCount: number;
    posts: number[];
  }

  export interface Proposal {
    id: number;
    proposer: string;
    description: string;
    votesFor: number;
    votesAgainst: number;
    voteThreshold: number;
    executed: boolean;
    deadline: number;
  }