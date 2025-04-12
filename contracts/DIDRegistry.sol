// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DIDRegistry {
    struct Identity {
        string name;
        string email;
        string location;
        uint256 createdAt;
        bool isActive;
    }
    
    struct AccessLog {
        address accessor;
        uint256 timestamp;
    }

    mapping(address => Identity) public identities;
    mapping(address => mapping(string => bool)) public attributeConsent;
    
    // New: Access logs mapping - owner address => array of access logs
    mapping(address => AccessLog[]) private accessLogs;
    
    event IdentityRegistered(address indexed owner, string name);
    event IdentityUpdated(address indexed owner);
    event ConsentUpdated(address indexed owner, string attribute, bool status);
    event IdentityDeactivated(address indexed owner);
    event IdentityAccessed(address indexed owner, address indexed accessor);

    modifier onlyIdentityOwner(address owner) {
        require(identities[owner].isActive, "Identity does not exist");
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier validateString(string memory str) {
        require(bytes(str).length > 0 && bytes(str).length <= 100, "Invalid string length");
        _;
    }

    function registerIdentity(
        string memory name,
        string memory email,
        string memory location
    ) public validateString(name) validateString(email) validateString(location) {
        require(!identities[msg.sender].isActive, "Identity already exists");
        
        identities[msg.sender] = Identity({
            name: name,
            email: email,
            location: location,
            createdAt: block.timestamp,
            isActive: true
        });

        emit IdentityRegistered(msg.sender, name);
    }

    function updateIdentity(string memory name, string memory email, string memory location) 
        public 
        onlyIdentityOwner(msg.sender) 
    {
        Identity storage identity = identities[msg.sender];
        identity.name = name;
        identity.email = email;
        identity.location = location;

        emit IdentityUpdated(msg.sender);
    }

    function updateConsent(string memory attribute, bool status) 
        public 
        onlyIdentityOwner(msg.sender) 
    {
        attributeConsent[msg.sender][attribute] = status;
        emit ConsentUpdated(msg.sender, attribute, status);
    }

    function getIdentity(address owner) 
        public 
        view 
        returns (
            string memory name,
            string memory email,
            string memory location,
            uint256 createdAt,
            bool isActive
        ) 
    {
        Identity memory identity = identities[owner];
        
        // Remove the logging code from here since view functions can't modify state
        
        return (
            identity.name,
            identity.email,
            identity.location,
            identity.createdAt,
            identity.isActive
        );
    }
    
    // Create a new function that does both: logs access AND returns identity data
    function getIdentityAndLog(address owner) 
        public 
        returns (
            string memory name,
            string memory email,
            string memory location,
            uint256 createdAt,
            bool isActive
        ) 
    {
        // Log access first (if applicable)
        if (msg.sender != owner && identities[owner].isActive) {
            accessLogs[owner].push(AccessLog({
                accessor: msg.sender,
                timestamp: block.timestamp
            }));
            
            emit IdentityAccessed(owner, msg.sender);
        }
        
        // Then return identity data
        Identity memory identity = identities[owner];
        return (
            identity.name,
            identity.email,
            identity.location,
            identity.createdAt,
            identity.isActive
        );
    }
    
    // Keep the logAccess function for standalone logging if needed
    function logAccess(address owner) public {
        // Only log if the identity exists and accessor isn't the owner
        if (identities[owner].isActive && msg.sender != owner) {
            accessLogs[owner].push(AccessLog({
                accessor: msg.sender,
                timestamp: block.timestamp
            }));
            
            emit IdentityAccessed(owner, msg.sender);
        }
    }
    
    // New function to retrieve access logs (only by identity owner)
    function getAccessLogs() 
    public 
    view 
    onlyIdentityOwner(msg.sender)
    returns (address[] memory accessors, uint256[] memory timestamps) 
{
    AccessLog[] storage logs = accessLogs[msg.sender];
    
    uint256 totalLogs = logs.length;
    
    // Create return arrays with the size of the total logs
    accessors = new address[](totalLogs);
    timestamps = new uint256[](totalLogs);
    
    // Fill the arrays with log data
    for (uint256 i = 0; i < totalLogs; i++) {
        AccessLog storage log = logs[i];
        accessors[i] = log.accessor;
        timestamps[i] = log.timestamp;
    }
    
    return (accessors, timestamps);
}

    
    // New function to get total number of access logs
    function getAccessLogsCount() 
        public 
        view 
        onlyIdentityOwner(msg.sender)
        returns (uint256) 
    {
        return accessLogs[msg.sender].length;
    }

    function checkConsent(address owner, string memory attribute) 
        public 
        view 
        returns (bool) 
    {
        return attributeConsent[owner][attribute];
    }

    function deactivateIdentity() public onlyIdentityOwner(msg.sender) {
        identities[msg.sender].isActive = false;
        emit IdentityDeactivated(msg.sender);
    }

    function getConsentBatch(address owner, string[] memory attributes) 
        public 
        view 
        returns (bool[] memory) 
    {
        bool[] memory results = new bool[](attributes.length);
        for (uint i = 0; i < attributes.length; i++) {
            results[i] = attributeConsent[owner][attributes[i]];
        }
        return results;
    }
}
