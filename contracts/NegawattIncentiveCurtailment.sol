// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NegawattIncentiveCurtailment {
    address public owner;
    uint public requiredTokens;
    uint public eventId;
    uint public totalCollected;
    bool public finalized;
    bool public initialized;
    bool public isCommitZero;
    mapping(uint => bool) private isUsedId;
    uint public totalCommitment;
    uint[] private consumers;


    struct Participant {
        uint participantId;
        address wallet;
        uint commitment;
        uint actualSupply;
        uint amountMissed;
        int incentive;
        int penalty;
        int balance;
    }

    Participant[] public participants;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function initialize(uint _eventId) public onlyOwner returns(bool success,string memory message){
        // require(!initialized, "Already initialized");
        if(initialized){
            success=false;
            message="Event already initialized";
            
        }else{
            eventId=_eventId;
            initialized = true;
            success=true;
            isCommitZero=true;
            totalCommitment=0;
            message='Event initialized success';

        }
    }
    function registerConsumer(uint _consumerId,uint _requiredToken) public returns(bool success,string memory message){
        //check if id already exist
        if(!initialized || finalized){
            success=false;
            message= !initialized ? "Event is not Initialized": "Event already finalied. Reset first";
        }else if(isUsedId[_consumerId]){
            success=false;
            message="Consumer Id Already Registered";
        }else{
            requiredTokens+=_requiredToken;
            consumers.push(_consumerId);
            isUsedId[_consumerId]=true;
            success=true;
            message="Consumer Registered Successfully";

        }
    }
    function reset() public onlyOwner returns(bool success,string memory message){
        // require(initialized, "Not initialized");
        if(!initialized){
            success=false;
            message="Event already unintialized";
        }else{
            for (uint i = 0; i < consumers.length; i++) {
                isUsedId[consumers[i]] = false;
            }
            delete consumers;
            for (uint i = 0; i < participants.length; i++) {
                isUsedId[participants[i].participantId] = false;
            }
            delete participants;
            initialized=false;
            success=true;
            finalized=false;
            requiredTokens=0;
            isCommitZero=true;
            totalCollected=0;
            totalCommitment=0;
            message="Start New Event";
        }

        
    }

    function registerParticipant(uint _participantId, uint _commitment, uint _actualSupply) public returns(bool success,string memory message){
        

        if(!initialized || finalized){
            success=false;
            message=!initialized ? "Event not initialized": "Event already finalized. Reset first";
            
        }else if(isUsedId[_participantId]){
            success=false;
            message="Participant Id Already Registered";

        }else if(_commitment<_actualSupply){
            success=false;
            message="Commitment is less than supply";
        }else{
            
            participants.push(Participant({
            participantId: _participantId,
            wallet: msg.sender,
            commitment: _commitment,
            actualSupply: _actualSupply,
            amountMissed: 0,
            incentive: 0,
            penalty: 0,
            balance: 0
            }));
            if(isCommitZero && _actualSupply>0){
                isCommitZero=false;
            }
            
            isUsedId[_participantId]=true;
            success=true;
            message='Participant registered successfully';
        }
        
    }

function finalizeResults() public onlyOwner returns(bool success,string memory message) {

    if(!initialized || finalized){
        
        success=false;
        message= finalized ? "Event already finalized":"Event not initialised";
    }else if(isCommitZero){
        finalized=true;
        success=true;
        message="No participant have any commitment";
        finalized = true;
        for (uint i = 0; i < participants.length; i++) {
            Participant storage p = participants[i];
            p.amountMissed = p.commitment;//all are missed as zero commitment
            p.incentive = 0;
            p.penalty = 0;
            p.balance = 0;
        }
        totalCommitment=0;

    }else{
        finalized = true;


        uint remainingNeed = requiredTokens;

        for (uint i = 0; i < participants.length; i++) {
            Participant storage p = participants[i];
            totalCommitment+=p.actualSupply;
            if (remainingNeed == 0) {
                p.amountMissed = 0;
                p.incentive = 0;
                p.penalty = 0;
                p.balance = 0;
            } else {
                if (p.actualSupply >= remainingNeed) {
                    totalCollected+=remainingNeed;
                    p.amountMissed = 0;
                    p.penalty = 0;
                    p.incentive = int(remainingNeed * 10);
                    p.balance = p.incentive;
                    remainingNeed = 0;
                } else {
                    p.amountMissed = p.commitment - p.actualSupply;
                    p.penalty = int(p.amountMissed * 5);
                    p.incentive = int(p.actualSupply * 10);
                    p.balance = p.incentive - p.penalty;
                    remainingNeed -= p.actualSupply;
                    totalCollected+=p.actualSupply;
                }
            }
        }

        success=true;
        message="Event successfully finalized";

    }
    
}




function getResults() public view returns (bool _isCommitZero,uint rtokens,int[][] memory data, bool contractSuccess,uint ceventId,uint _totalCommitment ) {
    require(initialized, "event not Initialized");//should initialized
    require(finalized, "Result not finalized");//should finalized
    uint count = participants.length;
    _isCommitZero=isCommitZero;
    data = new int[][](count); // outer array of int arrays
    

    for (uint i = 0; i < count; i++) {
        int[] memory row= new int[](7); // inner array with signed ints
        Participant memory p = participants[i];

        row[0] = int(p.participantId);      // casting from uint to int
        row[1]= int(p.commitment);           //commitment
        row[2]= int(p.actualSupply);       //contribution                                                      
        row[3] = int(p.amountMissed);       // safe since amountMissed >= 0
        row[4] = p.incentive;               // already int
        row[5] = p.penalty;                 // already int
        row[6] = p.balance;                 // already int

        data[i] = row;
    }

    contractSuccess = totalCollected >= requiredTokens;
    ceventId=eventId;
    _totalCommitment=totalCommitment;
    rtokens=requiredTokens;

    }

}
