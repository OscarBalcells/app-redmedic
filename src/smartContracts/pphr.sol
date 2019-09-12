pragma solidity ^0.5.1;
import "./acta.sol";
import "./mphr.sol";

contract PartialPHR {

    event Notification(bytes32 eventName);

    address private patient;
    address public provider;
    address constant public actaAddr = 0xF8b9217a03B0749c3b6150e53489F3F35Cf20cDf;
    Acta acta;

    mapping(bytes32 => mapping(address => bool)) public access;
    mapping(address => bool) fullAccess;
    mapping(bytes32 => mapping(address => uint)) public accessRevokeAt;
    mapping(address => uint) public fullAccessRevokeAt;

    mapping(bytes32 => uint) public indexOfSection;
    bytes32[] public sectionList;

    //gets created by provider
    constructor(address _patient, bytes32[] memory sections) public {

        patient = _patient;
        provider = msg.sender;

        acta = Acta(actaAddr);
        require(acta._isMember(provider) == true);

        /*
        MPHR masterPHR = MPHR(patient);
        masterPHR.newPartialPHR(provider, name);
        */

        for(uint i = 0; i < sections.length; i++) {
            sectionList.push(sections[i]);
            indexOfSection[sections[i]] = i;
        }

        fullAccess[provider] = true;
        fullAccess[patient] = true;
    }

    //INDEFINITE ACCESS

    function grantIndefiniteAccess(address account, bytes32[] memory sections) public {
        require(msg.sender == patient);
        for(uint i = 0; i < sections.length; i++) {
            access[sections[i]][account] = true;
        }
    }

    function revokeIndefiniteAccess(address account, bytes32[] memory sections) public {
        require(msg.sender == patient);
        for(uint i = 0; i < sections.length; i++) {
            access[sections[i]][account] = false;
        }
    }

    //FULL INDEFINITE ACCESS

    function grantFullAccess(address account) public {
        require(msg.sender == patient);
        fullAccess[account] = true;
    }

    function revokeFullAccess(address account) public {
        require(msg.sender == patient);
        fullAccess[account] = false;
    }

    //TEMPORARY ACCESS WHICH CAN'T BE REVOKED

    function grantTemporaryAccess(address account, bytes32[] memory sections, uint nHours) public {
        require(msg.sender == patient);
        uint willBeRevokedAt = block.timestamp + 1 hours * nHours;
        for(uint i = 0; i < sections.length; i++) {
            accessRevokeAt[sections[i]][account] = willBeRevokedAt;
        }
    }

    function grantTemporaryFullAccess(address account, uint nHours) public {
        require(msg.sender == patient);
        uint willBeRevokedAt = block.timestamp + 1 hours * nHours;
        fullAccessRevokeAt[account] = willBeRevokedAt;
    }

    ///MODIFY SECTIONS (ONLY PROVIDER CAN)

    function addSection(bytes32 newSection) public {
        require(msg.sender == provider);
        sectionList.push(newSection);
        indexOfSection[newSection] = sectionList.length-1;
    }

    function deleteSection(bytes32 deletedSection) public {
        require(msg.sender == provider);
        uint index = indexOfSection[deletedSection];
        if(sectionList.length > 1) {
            sectionList[index] = sectionList[sectionList.length-1];
        }
        sectionList.length--;
    }

    ///EXTERNAL QUERY FUNCTIONS

    function hasAccess(address account, bytes32[] memory sections) public view returns (bool) {
        if(fullAccess[account] == true) return true;
        else if(fullAccessRevokeAt[account] > block.timestamp) return true;

        for(uint i=0; i < sections.length; i++) {
            if(access[sections[i]][account] == false && accessRevokeAt[sections[i]][account] < block.timestamp) {
                return false;
            }
        }
        return true;
    }

    function getSections() public view returns (bytes32[] memory) {
        return sectionList;
    }

    ///SELFDESTROY

    function destroy() public {
        require(msg.sender == patient);
        address payable actaPayableAddr = address(uint160(address(actaAddr)));
        selfdestruct(actaPayableAddr);
    }

    ///INFO INSIDE PPHR CHANGED, SO WE EMIT NOTIFICATION

    function emitNotification() public {
        require(msg.sender == provider);
        emit Notification("Notification");
    }

}
