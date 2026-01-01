// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ExamPaperRegistry
 * @dev Manages the secure registration and retrieval of exam papers hashes.
 * Note: Role checks are disabled for demo/testing purposes.
 */
contract ExamPaperRegistry {
    enum Role { None, Setter, Moderator, Printer, Admin }
    enum PaperStatus { Uploaded, Approved, Rejected }

    struct Paper {
        uint256 id;
        string ipfsHash;
        address uploader;
        uint256 uploadTime;
        PaperStatus status;
        address approver;
        uint256 approvalTime;
    }

    mapping(address => Role) public userRoles;
    mapping(uint256 => Paper) public papers;
    mapping(string => uint256) public hashToId;
    uint256 public paperCount;

    event UserRoleUpdated(address indexed user, Role role);
    event PaperUploaded(uint256 indexed paperId, address indexed uploader, string paperHash);
    event PaperStatusUpdated(uint256 indexed paperId, PaperStatus status, address indexed moderator);

    constructor() {
        userRoles[msg.sender] = Role.Admin;
    }

    // --- User Management ---
    function setUserRole(address _user, Role _role) external {
        // Anyone can set roles in demo mode
        userRoles[_user] = _role;
        emit UserRoleUpdated(_user, _role);
    }

    // --- Paper Management ---
    function uploadPaper(string memory _paperHash) external {
        // No role check - anyone can upload in demo mode
        require(hashToId[_paperHash] == 0, "Paper already registered");
        paperCount++;
        papers[paperCount] = Paper({
            id: paperCount,
            ipfsHash: _paperHash,
            uploader: msg.sender,
            uploadTime: block.timestamp,
            status: PaperStatus.Uploaded,
            approver: address(0),
            approvalTime: 0
        });
        hashToId[_paperHash] = paperCount;
        emit PaperUploaded(paperCount, msg.sender, _paperHash);
    }

    function reviewPaper(uint256 _paperId, bool _approved) external {
        // No role check - anyone can review in demo mode
        require(_paperId > 0 && _paperId <= paperCount, "Invalid Paper ID");
        require(papers[_paperId].status == PaperStatus.Uploaded, "Paper not in pending status");

        if (_approved) {
            papers[_paperId].status = PaperStatus.Approved;
        } else {
            papers[_paperId].status = PaperStatus.Rejected;
        }
        papers[_paperId].approver = msg.sender;
        papers[_paperId].approvalTime = block.timestamp;

        emit PaperStatusUpdated(_paperId, papers[_paperId].status, msg.sender);
    }

    function getPaper(uint256 _paperId) external view returns (Paper memory) {
        // Anyone can view papers
        return papers[_paperId];
    }

    function verifyPaper(string memory _paperHash) external view returns (bool exists, uint256 paperId) {
        paperId = hashToId[_paperHash];
        exists = paperId > 0;
    }
}
