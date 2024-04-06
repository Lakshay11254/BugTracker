import React, { useState, useEffect } from "react";
import { contractABI, contractAddress } from "./config";
import { FaTrashAlt } from "react-icons/fa";

const { Web3 } = require("web3");

const web3 = new Web3("http://localhost:7545");

const bugTrackerContract = new web3.eth.Contract(contractABI, contractAddress);

function BugTracker() {
  const [bugs, setBugs] = useState([]);
  const [bugId, setBugId] = useState("");
  const [description, setDescription] = useState("");
  const [criticality, setCriticality] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Function to fetch bugs from the blockchain and update the state
  const fetchBugs = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const bugCount = await bugTrackerContract.methods
        .getBugCount()
        .call({ from: accounts[0] });
      const bugList = await Promise.all(
        Array.from({ length: Number(bugCount) }, (_, i) =>
          bugTrackerContract.methods.getTask(i).call({ from: accounts[0] })
        )
      );
      setBugs(bugList);
    } catch (error) {
      console.error("Error fetching bugs", error);
    }
  };

  useEffect(() => {
    fetchBugs(); // Fetch bugs when the component mounts
  }, []); // Empty dependency array ensures this effect runs only once

  const handleCreateBug = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await bugTrackerContract.methods
        .addBug(bugId, description, criticality, isDone)
        .send({ from: accounts[0], gas: 1000000 });
      fetchBugs(); // Fetch updated bugs after adding a new bug
    } catch (error) {
      console.error("Error adding bug", error);
    }
  };

  // const handleUpdateBug = async (bugIndex) => {
  //   try {
  //     const accounts = await web3.eth.getAccounts();
  //     await bugTrackerContract.methods
  //       .updateBug(bugId, description, criticality, isDone) // Adjust parameters as needed
  //       .send({ from: accounts[0], gas: 1000000 });
  //     fetchBugs(); // Fetch updated bugs after updating a bug
  //   } catch (error) {
  //     console.error("Error updating bug", error);
  //   }
  // };

  const handleDeleteBug = async (bugIndex) => {
    try {
      const accounts = await web3.eth.getAccounts();
      await bugTrackerContract.methods
        .deleteBug(bugIndex)
        .send({ from: accounts[0], gas: 1000000 });
      fetchBugs(); // Fetch updated bugs after deleting a bug
    } catch (error) {
      console.error("Error deleting bug", error);
    }
  };

  function getCriticalityLabel(criticality) {
    switch (criticality) {
      case "0":
        return "Low";
      case "1":
        return "Medium";
      case "2":
        return "High";
      default:
        return "";
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">BugTracker</h1>
      <div className="flex mb-4">
        <input
          type="text"
          value={bugId}
          placeholder="Bug ID"
          onChange={(e) => setBugId(e.target.value)}
          className="mr-2 px-3 py-2 border border-gray-300 rounded-md w-1/4"
        />
        <input
          type="text"
          value={description}
          placeholder="Description..."
          onChange={(e) => setDescription(e.target.value)}
          className="mr-2 px-3 py-2 border border-gray-300 rounded-md flex-grow"
        />
        <select
          value={criticality}
          onChange={(e) => setCriticality(e.target.value)}
          className="mr-2 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
        </select>
        <input
          type="checkbox"
          checked={isDone}
          onChange={(e) => setIsDone(e.target.checked)}
          className="mr-2"
        />
        <button
          onClick={handleCreateBug}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Bug
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {bugs.map((bug, index) => (
          <li key={index} className="py-4 flex items-center">
            <div className="flex-1">
              <div className="border border-gray-300 rounded-lg p-5">
                <div className="flex justify-between">
                  <span className="font-bold">ID:</span>
                  <span>{bug.bugId}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-bold">Description:</span>
                  <span>{bug.description}</span>
                </div>
                <div className="flex justify-between mt-2 ">
                  <span className="font-bold">Criticality:</span>
                  <span>{getCriticalityLabel(bug.criticality.toString())}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-bold">Done:</span>
                  <span>{bug.isDone.toString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDeleteBug(index)}
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              <FaTrashAlt className="mr-1 flex" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BugTracker;
