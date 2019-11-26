module.exports = {
    mphrABI: '[{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"}],"name":"deletePPHR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"}],"name":"getPPHR","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"acta","outputs":[{"internalType":"contract Acta","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"gateways","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"actaAddr","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32","name":"section","type":"bytes32"}],"name":"revokeAccess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"pphrAddr","type":"address"}],"name":"newPPHR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"returnGateways","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"name","type":"bytes32"},{"internalType":"address","name":"addr","type":"address"},{"internalType":"bytes32","name":"section","type":"bytes32"},{"internalType":"uint256","name":"nHours","type":"uint256"}],"name":"grantAccess","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_id","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]',
    pphrABI: '',
    Categories: [
        "allergies", 
        "labs", 
        "procedures", 
        "immunizations", 
        "medications", 
        "conditions", 
        "images"
    ],
    PossibleDates: [
        "performedDatePeriod",
        "performedPeriod",
        "recordedDate",
        "date",
        "dateRecorded",
        "effectiveDateTime",
        "effectiveTimeDate",
        "dateWritten",
        "performedDateTime"
    ],
    ProviderNames: [
        "Corachan",
        "Teknon",
        "Pilar"
    ],
    GetDate: function(resource) {
        for(var i = 0; i < PossibleDates.length; i++) {
            if(resource.hasOwnProperty(PossibleDates[i])) {
                let date = null;
                if(i <= 1) { date = resource[PossibleDates[i]]["end"]; }
                else { date = resource[PossibleDates[i]]; }
                let d = date.split("-")[0];
                if(d.length == 1) { d = "0"+d; }
                let m = date.split("-")[1];
                if(m.length == 1) { m = "0"+m; }
                let y = date.split("-")[2].slice(0,4);
                return d+"-"+m+"-"+y;
            }
        }
    },
    GetSummary: function(resource) {
        let type = resource.resourceType;
        if(type === "AllergyIntolerance") return resource.substance+"  -  "+resource.status;
        else if(type === "Condition") return resource.code.coding[0].display+"  -  "+resource.clinicalStatus;
        else if(type === "Immunization") return resource.vaccineCode.text+"  -  "+resource.status;
        else if(type === "Observation") return resource.code.text+"  -  "+resource.valueQuantity.value+" "+resource.valueQuantity.unit;
        else if(type === "MedicationOrder") return resource.medicationReference;
        else if(type === "Procedure") return resource.code.text+"  -  "+resource.status;
        else if(type === "Images") return resource.notes;
    },
    Gradients: {
        "allergies": "linear-gradient(#b30086,#ff00bf)",
        "labs": "linear-gradient(#6691ff,#3f2b96)",
        "procedures": "linear-gradient(#00B4DB,#00B4DB)",
        "immunizations": "linear-gradient(#33ff77,#00b33c)",
        "medications": "linear-gradient(#F00000, #DC281E)",
        "conditions": "linear-gradient(#00cccc,#008080)",
        "images": "linear-gradient(#ff1aff,#e600e6)",
        "personalData": "linear-gradient(rgba(219,40,40,1), rgba(252,124,69,1))"
    }
}
