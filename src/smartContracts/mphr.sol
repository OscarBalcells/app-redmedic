pragma solidity ^0.5.1;
import "./pphr.sol";
import "./acta.sol";

contract MasterPHR {

    struct PPHR {
        bytes32[] sections;
        bytes32 providerName;
        address providerAddr;
        address pphrAddr;
        bytes32 gateway;
        bool exists;
    }

    address public actaAddr = 0xF8b9217a03B0749c3b6150e53489F3F35Cf20cDf;
    Acta public acta = Acta(actaAddr);

    bytes32 public id;
    address private owner;

    mapping (bytes32 => PPHR) private pphrs;
    mapping (bytes32 => PPHR) private pphrsUnconfirmed;
    mapping (address => bytes32) private addrToName;
    bytes32[] private providerNameList;
    mapping (bytes32 => uint) gatewayAtIndex;
    bytes32[] private gateways;

    constructor(bytes32 _id) public {
        id = _id;
        owner = msg.sender;
    }

    function newPPHR(address providerAddr, bytes32[] memory sections) public {
        require(acta._isMember(providerAddr) == true);

        bytes32 providerName; bytes32 gateway;
        (providerName, gateway) = acta.getMember(providerAddr);

        require(pphrs[providerName].exists == false);
        require(pphrsUnconfirmed[providerName].exists == false);

        pphrsUnconfirmed[providerName] = PPHR({
            sections: sections,
            providerName: providerName,
            providerAddr: providerAddr,
            pphrAddr: msg.sender,
            gateway: gateway,
            exists: true
        });

        addrToName[providerAddr] = providerName;
        addrToName[msg.sender] = providerName;
    }

    function confirmPPHR(bytes32 name) public {
        require(pphrs[name].exists == false);
        require(pphrsUnconfirmed[name].exists == true);
        pphrs[name] = pphrsUnconfirmed[name];
        gateways.push(pphrs[name].gateway);
        gatewayAtIndex[pphrs[name].gateway] = gateways.length-1;
        delete pphrsUnconfirmed[name];
    }

    ///INTERACTION WITH Partial PHR's

    function deletePPHR(bytes32 name) public {
        require(msg.sender == owner);
        bytes32 gateway;

        if(pphrs[name].exists == true) {
            PartialPHR pphr = PartialPHR(pphrs[name].pphrAddr);
            gateway = pphrs[name].gateway;
            pphr.destroy();
        } else if(pphrsUnconfirmed[name].exists == true) {
            PartialPHR pphr = PartialPHR(pphrsUnconfirmed[name].pphrAddr);
            gateway = pphrs[name].gateway;
            pphr.destroy();
            return;
        } else {
            revert();
        }

        uint index = gatewayAtIndex[gateway];
        gateways[index] = gateways[gateways.length-1];
        gatewayAtIndex[gateways[index]] = index;
        gateways.length--;
    }

    ///EXTERNAL QUERY FUNCTIONS

    function returnGateways() public view returns (bytes32[] memory) {
        require(msg.sender == owner);
        return gateways;
    }

    function getPPHR(bytes32 name) public view returns (bytes32[] memory sections, address providerAddr,
    address pphrAddr, bytes32 gateway) {
        require(pphrs[name].exists == true);
        require(msg.sender == owner);
        return (pphrs[name].sections, pphrs[name].providerAddr,
        pphrs[name].pphrAddr, pphrs[name].gateway);
    }
}
