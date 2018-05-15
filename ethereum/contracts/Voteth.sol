pragma solidity ^0.4.17;

contract VotethSubjectFactory {
    address[] public votethSubjects;
    
    function addSubject(string _subject, string _description) public {
        address votethSubject = new VotethSubject(_subject, _description, msg.sender);
        votethSubjects.push(votethSubject);
    }
    
    function getSubjects() public view returns(address[]) {
        return votethSubjects;
    }
}

contract VotethSubject {
    string public subject;
    string public description;
    VotethPost[] public votethPosts;
    mapping (address => bool) public adminList;
    
    constructor(string _subject, string _description, address _author) public {
        subject = _subject;
        description = _description;
        adminList[_author] = true;
    }
    
    function addPost(string _title, string _content, string _nickname) public {
        VotethPost votethPost = new VotethPost(_title, _content, _nickname, msg.sender);
        votethPosts.push(votethPost);
    }
    
    function editDescription(string _newDescription) public {
        require(adminList[msg.sender]);
        description = _newDescription;
    }
    
    function addAdmin(address _newAdmin) public {
        require(adminList[msg.sender]);
        adminList[_newAdmin] = true;
    }
    
}

contract VotethPost {
    string public title;
    string public content;
    address public author;
    string public nickname;
    uint public lastEdited = now;
    bool public wasEdited = false;
    mapping (address => bool) voteList;
    int public commentScore = 0;
    uint public ethScore = 0;
    uint public ethBalance = 0;
    bool public isRecent = true;
    VotethComment[] public votethComments;
    
    constructor(string _title, string _content, string _nickname, address _author) public {
        title = _title;
        content = _content;
        nickname = _nickname;
        author = _author;
    }
    
    function editContent(string _newTitle, string _newContent) public {
        require(msg.sender == author);
        title = _newTitle;
        content = _newContent;
        wasEdited = true;
        lastEdited = now;
    }
    
    function withdrawEth() public {
        require(msg.sender == author);
        author.transfer(ethBalance); // TODO: Make sure this is safe, might be a security vulnerability here
        ethBalance = 0;
    }
    
    function addComment(string _comment, string _nickname) public {
        VotethComment comment = new VotethComment(_comment, _nickname, msg.sender);
        votethComments.push(comment);
    }
    
    function downvoteContent() public {
        require(!voteList[msg.sender]);
        voteList[msg.sender] = true;
        commentScore--;
    }
    
    function upvoteContent() public payable {
        require(!voteList[msg.sender]);
        voteList[msg.sender] = true;
        commentScore++;
        ethScore += msg.value; //TODO: Make this safe math
        ethBalance += msg.value;
    }
}


// TODO: IMPLEMENT COMMENT CHAINS
contract VotethComment {
    string public comment;
    address public author;
    string public nickname;
    uint public lastEdited = now;
    bool public wasEdited = false;
    mapping (address => bool) voteList;
    int public commentScore = 0;
    uint public ethScore = 0;
    uint public ethBalance = 0;

    constructor(string _comment, string _nickname, address _author) public {
        comment = _comment;
        nickname = _nickname;
        author = _author;
    }
    
    function editComment(string _newComment) public {
        require(msg.sender == author);
        comment = _newComment;
        wasEdited = true;
        lastEdited = now;
    }
    
    function withdrawEth() public {
        require(msg.sender == author);
        author.transfer(ethBalance); // TODO: Make sure this is safe, might be a security vulnerability here
        ethBalance = 0;
    }
    
    function downvoteComment() public {
        require(!voteList[msg.sender]);
        voteList[msg.sender] = true;
        commentScore--;
    }
    
    function upvoteComment() public payable {
        require(!voteList[msg.sender]);
        voteList[msg.sender] = true;
        commentScore++;
        ethScore += msg.value; //TODO: Make this safe math
        ethBalance += msg.value;
    }
}