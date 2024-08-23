// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Swartz is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {
        // The msg.sender (contract deployer) will be set as the initial owner
    }

    struct User {
        string username;
        string imageHash;
        uint256[] posts;
        uint256[] comments;
        address[] followers;
        address[] following;
        uint256[] subgroupsJoined;
        mapping(address => bool) isFollower;
        mapping(address => bool) isFollowing;
        mapping(uint256 => bool) isSubgroupsJoined;
    }

    struct Post {
        string title;
        uint256 timestamp;
        uint256[] subgroups;
        string description;
        string imageHash;
        uint256 likeCount;
        uint256[] comments;
        address author;
        bool isDeleted;
    }

    struct Comment {
        address author;
        string content;
        uint256 timestamp;
        bool isDeleted;
    }

    struct Subgroup {
        string name;
        mapping(address => bool) subscribers;
        uint256[] posts;
        uint256 subscriberCount;
    }

    mapping(string => bool) public isTakenUsername;
    mapping(string => bool) public isTakenSubgroupName;
    mapping(address => User) public users;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment) public comments;
    mapping(uint256 => Subgroup) public subgroups;
    mapping(uint256 => mapping(address => bool)) public postLikes;

    uint256 public postCount;
    uint256 public commentCount;
    uint256 public subgroupCount;
    uint256 public constant MAX_SUBGROUPS_PER_POST = 10;

    event UserCreated(address indexed userAddress, string username);
    event UserUpdated(
        address indexed userAddress,
        string username,
        string imageHash
    );
    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string title
    );
    event CommentAdded(
        uint256 indexed postId,
        uint256 indexed commentId,
        address indexed author
    );
    event SubgroupCreated(uint256 indexed subgroupId, string name);
    event UserFollowed(address indexed follower, address indexed followed);
    event UserUnfollowed(
        address indexed unfollower,
        address indexed unfollowed
    );
    event CommentDeleted(uint256 indexed postId, uint256 indexed commentId);
    event PostDeleted(uint256 indexed postId);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event SubgroupJoined(uint256 indexed subgroupId, address indexed user);
    event SubgroupLeft(uint256 indexed subgroupId, address indexed user);

    modifier userExists(address _user) {
        require(bytes(users[_user].username).length > 0, "User does not exist");
        _;
    }

    modifier validPost(uint256 _postId) {
        require(
            _postId > 0 && _postId <= postCount && !posts[_postId].isDeleted,
            "Invalid post ID"
        );
        _;
    }

    modifier validComment(uint256 _commentId) {
        require(
            _commentId > 0 &&
                _commentId <= commentCount &&
                !comments[_commentId].isDeleted,
            "Invalid comment ID"
        );
        _;
    }

    modifier validSubgroup(uint256 _subgroupId) {
        require(
            _subgroupId > 0 && _subgroupId <= subgroupCount,
            "Invalid subgroup ID"
        );
        _;
    }

    function createUser(string memory _username, string memory _imageHash)
        public
    {
        require(
            bytes(users[msg.sender].username).length == 0,
            "User already exists"
        );
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(!isTakenUsername[_username], "Username Taken.");
        users[msg.sender].username = _username;
        users[msg.sender].imageHash = _imageHash;
        emit UserCreated(msg.sender, _username);
    }

    function updateUser(string memory _username, string memory _imageHash)
        public
        userExists(msg.sender)
    {
        require(bytes(_username).length > 0, "Username cannot be empty");
        users[msg.sender].username = _username;
        users[msg.sender].imageHash = _imageHash;
        emit UserUpdated(msg.sender, _username, _imageHash);
    }

    function createPost(
        string memory _title,
        uint256[] memory _subgroups,
        string memory _description,
        string memory _imageHash
    ) public userExists(msg.sender) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(
            _subgroups.length <= MAX_SUBGROUPS_PER_POST,
            "Too many subgroups"
        );
        postCount++;
        posts[postCount] = Post(
            _title,
            block.timestamp,
            _subgroups,
            _description,
            _imageHash,
            0,
            new uint256[](0),
            msg.sender,
            false
        );
        users[msg.sender].posts.push(postCount);
        for (uint256 i = 0; i < _subgroups.length; i++) {
            require(
                _subgroups[i] > 0 && _subgroups[i] <= subgroupCount,
                "Invalid subgroup ID"
            );
            require(subgroups[_subgroups[i]].subscribers[msg.sender], "Not a member of group.");
            subgroups[_subgroups[i]].posts.push(postCount);
        }
        emit PostCreated(postCount, msg.sender, _title);
    }

    function addComment(uint256 _postId, string memory _content)
        public
        userExists(msg.sender)
        validPost(_postId)
    {
        require(bytes(_content).length > 0, "Comment cannot be empty");
        commentCount++;
        comments[commentCount] = Comment(
            msg.sender,
            _content,
            block.timestamp,
            false
        );
        posts[_postId].comments.push(commentCount);
        users[msg.sender].comments.push(commentCount);
        emit CommentAdded(_postId, commentCount, msg.sender);
    }

    function createSubgroup(string memory _name) public userExists(msg.sender) {
        require(bytes(_name).length > 0, "Subgroup name cannot be empty");
        require(!isTakenSubgroupName[_name], "Subgroup name is taken");
        subgroupCount++;
        subgroups[subgroupCount].name = _name;
        subgroups[subgroupCount].subscriberCount = 1;
        subgroups[subgroupCount].subscribers[msg.sender] = true;
        users[msg.sender].isSubgroupsJoined[subgroupCount] = true;
        users[msg.sender].subgroupsJoined.push(subgroupCount);
        isTakenSubgroupName[_name] = true;
        emit SubgroupCreated(subgroupCount, _name);
    }

    function joinSubgroup(uint256 _subgroupId)
        public
        userExists(msg.sender)
        validSubgroup(_subgroupId)
    {
        require(
            !users[msg.sender].isSubgroupsJoined[_subgroupId],
            "Already joined this subgroup"
        );
        subgroups[_subgroupId].subscribers[msg.sender] = true;
        subgroups[subgroupCount].subscriberCount++;
        users[msg.sender].isSubgroupsJoined[_subgroupId] = true;
        users[msg.sender].subgroupsJoined.push(_subgroupId);
        emit SubgroupJoined(_subgroupId, msg.sender);
    }

    function leaveSubgroup(uint256 _subgroupId)
        public
        userExists(msg.sender)
        validSubgroup(_subgroupId)
    {
        require(
            users[msg.sender].isSubgroupsJoined[_subgroupId],
            "Not a member of this subgroup"
        );
        subgroups[_subgroupId].subscribers[msg.sender] = false;
        subgroups[subgroupCount].subscriberCount--;
        users[msg.sender].isSubgroupsJoined[_subgroupId] = false;
        for (uint256 i = 0; i < users[msg.sender].subgroupsJoined.length; i++) {
            if (users[msg.sender].subgroupsJoined[i] == _subgroupId) {
                users[msg.sender].subgroupsJoined[i] = users[msg.sender]
                    .subgroupsJoined[
                        users[msg.sender].subgroupsJoined.length - 1
                    ];
                users[msg.sender].subgroupsJoined.pop();
                break;
            }
        }
        emit SubgroupLeft(_subgroupId, msg.sender);
    }

    function followUser(address _userToFollow)
        public
        userExists(msg.sender)
        userExists(_userToFollow)
    {
        require(msg.sender != _userToFollow, "Cannot follow yourself");
        require(
            !users[msg.sender].isFollowing[_userToFollow],
            "Already following this user"
        );
        users[msg.sender].isFollowing[_userToFollow] = true;
        users[_userToFollow].isFollower[msg.sender] = true;
        users[msg.sender].following.push(_userToFollow);
        users[_userToFollow].followers.push(msg.sender);
        emit UserFollowed(msg.sender, _userToFollow);
    }

    function unfollowUser(address _userToUnfollow)
        public
        userExists(msg.sender)
        userExists(_userToUnfollow)
    {
        require(
            users[msg.sender].isFollowing[_userToUnfollow],
            "Not following this user"
        );
        users[msg.sender].isFollowing[_userToUnfollow] = false;
        users[_userToUnfollow].isFollower[msg.sender] = false;
        for (uint256 i = 0; i < users[msg.sender].following.length; i++) {
            if (users[msg.sender].following[i] == _userToUnfollow) {
                users[msg.sender].following[i] = users[msg.sender].following[
                    users[msg.sender].following.length - 1
                ];
                users[msg.sender].following.pop();
                break;
            }
        }
        for (uint256 i = 0; i < users[_userToUnfollow].followers.length; i++) {
            if (users[_userToUnfollow].followers[i] == msg.sender) {
                users[_userToUnfollow].followers[i] = users[_userToUnfollow]
                    .followers[users[_userToUnfollow].followers.length - 1];
                users[_userToUnfollow].followers.pop();
                break;
            }
        }
        emit UserUnfollowed(msg.sender, _userToUnfollow);
    }

    function likePost(uint256 _postId)
        public
        userExists(msg.sender)
        validPost(_postId)
    {
        require(!postLikes[_postId][msg.sender], "Already liked this post");
        postLikes[_postId][msg.sender] = true;
        posts[_postId].likeCount++;
        emit PostLiked(_postId, msg.sender);
    }

    function unlikePost(uint256 _postId)
        public
        userExists(msg.sender)
        validPost(_postId)
    {
        require(postLikes[_postId][msg.sender], "Haven't liked this post");
        postLikes[_postId][msg.sender] = false;
        posts[_postId].likeCount--;
        emit PostUnliked(_postId, msg.sender);
    }

    function deleteComment(uint256 _postId, uint256 _commentId)
        public
        userExists(msg.sender)
        validPost(_postId)
        validComment(_commentId)
    {
        require(
            comments[_commentId].author == msg.sender,
            "Not the comment author"
        );
        comments[_commentId].isDeleted = true;
        emit CommentDeleted(_postId, _commentId);
    }

    function deletePost(uint256 _postId)
        public
        userExists(msg.sender)
        validPost(_postId)
    {
        require(posts[_postId].author == msg.sender, "Not the post author");
        posts[_postId].isDeleted = true;
        emit PostDeleted(_postId);
    }

    function getUser(address _user)
        public
        view
        returns (
            string memory username,
            string memory imageHash,
            uint256[] memory userPosts,
            uint256[] memory userComments,
            address[] memory followers,
            address[] memory following,
            uint256[] memory subgroupsJoined
        )
    {
        User storage user = users[_user];
        username = user.username;
        imageHash = user.imageHash;
        userPosts = user.posts;
        userComments = user.comments;
        followers = user.followers;
        following = user.following;
        subgroupsJoined = user.subgroupsJoined;
    }

    function getPost(uint256 _postId)
        public
        view
        returns (
            string memory _title,
            uint256 _timestamp,
            uint256[] memory _subgroups,
            string memory _description,
            string memory _imageHash,
            uint256 _likeCount,
            address _author,
            bool _isDeleted,
            uint256[] memory _comments
        )
    {
        Post memory post = posts[_postId];
        _title = post.title;
        _timestamp = post.timestamp;
        _subgroups = post.subgroups;
        _description = post.description;
        _imageHash = post.imageHash;
        _likeCount = post.likeCount;
        _author = post.author;
        _isDeleted = post.isDeleted;
        _comments = post.comments;
    }

    function getSubgroup(uint256 _subgroupId)
        public
        view
        returns (
            string memory _name,
            uint256[] memory _posts,
            uint256 _subscriberCount
        )
    {
        Subgroup storage subgroup = subgroups[_subgroupId];
        _name = subgroup.name;
        _posts = subgroup.posts;
        _subscriberCount = subgroup.subscriberCount;
    }
}