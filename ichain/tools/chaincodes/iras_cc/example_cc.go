/*
Copyright IBM Corp. 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main


import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

var logger = shim.NewLogger("example_cc0")

type File struct {
	FileHash    string `json:"fileHash"`
	FileName    string `json:"fileName"`
	UserName    string `json:"userName"`
	Security    string `json:"security"`
	FileSize    int    `json:"fileSize"`
	AccessType  string `json:"accessType"`
	Result      string `json:"result"`
	Date        string `json:"date"`
	Description string `json:"description"`
}

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

// Init - initialize the state
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response  {
	logger.Info("########### Upgrade example_cc0 Init ###########")

	_, args := stub.GetFunctionAndParameters()
	var A, B string    // Entities
	var Aval, Bval int // Asset holdings
	var err error

    if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}
	
	// Initialize the chaincode
	A = args[0]
	Aval, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	B = args[2]
	Bval, err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding")
	}
	logger.Infof("Aval = %d, Bval = %d\n", Aval, Bval)

	// Write the state to the ledger
	err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(B, []byte(strconv.Itoa(Bval)))
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Invoke - Transaction makes payment of X units from A to B
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Info("########### example_cc0 Invoke ###########")

	function, args := stub.GetFunctionAndParameters()

	logger.Infof("function : %s, args : %s ",function, args)

	if function == "addFile" {
		// Add an entity to its state
		return t.addFile(stub, args)
	}

	logger.Errorf("Unknown action, check the first argument, must be one of 'addFile' : %v", args[0])
	return shim.Error(fmt.Sprintf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", args[0]))
}

func (t *SimpleChaincode) addFile(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	logger.Infof("function addFile called!!!")

	var FileHash    string
	var FileName    string
	var UserName    string
	var Security    string
	var FileSize    int
	var AccessType  string
	var Result	string
	var Date        string
	var Description string

	//if len(args) != 9 { // The number of input parameter should be 22
	//	return shim.Error("Incorrect number of arguments. Expecting 8, function followed by 8 names")
	//}

	logger.Infof("args called!!!")

	var err error

	FileHash = args[0]
	FileName = args[1]
	UserName = args[2]
	Security = args[3]
	logger.Infof("args atoi!!!")
	FileSize, err = strconv.Atoi(args[4])
	AccessType = args[5]
	Result = args[6]
	Date = args[7]
	Description = args[8]

  	logger.Info("File!!")
	// ==== Create the object and marshal to JSON ====
	File := &File{FileHash, FileName, UserName, Security, FileSize, AccessType,
		Result, Date, Description}

	logger.Infof("Marshal()")
	FileJSONasBytes, err := json.Marshal(File)
	if err != nil {
                logger.Info("Marshal error !!!")
		return shim.Error(err.Error())
	}

  	logger.Infof("putstate called!!!")
	// Write the state to the ledger
	err = stub.PutState(FileHash, FileJSONasBytes)
	if err != nil {
                logger.Info("Putstate error !!!")
		return shim.Error(err.Error())
	}

	return shim.Success([]byte("Successfully add File to the ledger"))
}

func (t *SimpleChaincode) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	var A string // Entities
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the person to query")
	}

	A = args[0]

	// Get the state from the ledger
	Avalbytes, err := stub.GetState(A)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + A + "\"}"
		return shim.Error(jsonResp)
	}

	if Avalbytes == nil {
		jsonResp := "{\"Error\":\"Nil amount for " + A + "\"}"
		return shim.Error(jsonResp)
	}

	jsonResp := "{\"Name\":\"" + A + "\",\"Amount\":\"" + string(Avalbytes) + "\"}"
	logger.Infof("Query Response:%s\n", jsonResp)
	return shim.Success(Avalbytes)
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		logger.Errorf("Error starting Simple chaincode: %s", err)
	}
}
