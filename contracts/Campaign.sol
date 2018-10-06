pragma solidity ^0.4.24;

contract Campaign {
    
    uint public promiseIndex;
    
    // Look up promise by candidate's address
    mapping (address => mapping (uint => Promise)) campaigns;
    // Look up candidate by promise id
    mapping (uint => address) promiseIdInCampaign;
    
    struct Promise {
        uint id;
        string candidateFirstName;
        string candidateLastName;
        string party;
        string electionType;
        string promiseDescHash;
    }

    event NewPromise(
        uint _id,
        string _candidateFirstName,
        string _candidateLastName,
        string _party,
        string _electionType,
        string _promiseDescHash
    );
    
    constructor() public {
        promiseIndex = 0;
    }

    function addPromiseToCampaign(
        string _candidateFirstName,
        string _candidateLastName,
        string _party,
        string _electionType,
        string _promiseDescHash
        ) public {
        promiseIndex ++;
        Promise memory promise = Promise(
            promiseIndex, 
            _candidateFirstName, 
            _candidateLastName, 
            _party, 
            _electionType, 
            _promiseDescHash 
        );
        campaigns[msg.sender][promiseIndex] = promise;
        promiseIdInCampaign[promiseIndex] = msg.sender;    
        emit NewPromise(promiseIndex, _candidateFirstName, _candidateLastName, _party, _electionType, _promiseDescHash);
    }
    
    function getPromise(uint _promiseId) public view returns (uint, string, string, string, string, string) {
        Promise memory promise = campaigns[promiseIdInCampaign[_promiseId]][_promiseId];
        return (promise.id, promise.candidateFirstName, promise.candidateLastName, promise.party, promise.electionType, promise.promiseDescHash);
    }
}