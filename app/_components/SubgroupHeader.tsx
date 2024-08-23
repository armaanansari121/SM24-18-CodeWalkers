import { Proposal, Subgroup } from '@/types';
import React, { useState, useEffect } from 'react';

import Web3 from 'web3';
import { useContract } from '../_contexts/ContractContext';

interface SubgroupHeaderProps {
  subgroup: Subgroup;
}

const SubgroupHeader: React.FC<SubgroupHeaderProps> = ({ subgroup }) => {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollDescription, setPollDescription] = useState('');
  const [voteThreshold, setVoteThreshold] = useState('');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { GovernanceContract,account } = useContract();

  useEffect(() => {
    fetchProposals();
  }, [GovernanceContract]);

  const fetchProposals = async () => {
    if (GovernanceContract) {
      try {
        const proposalCount = await GovernanceContract.methods.proposalCount().call();
        const fetchedProposals = await Promise.all(
          Array.from({ length: proposalCount }, (_, i) =>
          GovernanceContract.methods.proposals(i + 1).call()
          )
        );
        setProposals(fetchedProposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    }
  };

  const handleCreatePoll = async () => {
    if (GovernanceContract && pollDescription && voteThreshold) {
      try {
        await GovernanceContract.methods
          .createProposal(pollDescription, Web3.utils.toWei(voteThreshold, 'ether'))
          .send({ from: account});
        setShowCreatePoll(false);
        setPollDescription('');
        setVoteThreshold('');
        fetchProposals();
      } catch (error) {
        console.error('Error creating proposal:', error);
      }
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (GovernanceContract) {
      try {
        await GovernanceContract.methods
          .vote(proposalId, support)
          .send({ from:account });
        fetchProposals();
      } catch (error) {
        console.error('Error voting:', error);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{subgroup.name}</h1>
        <button
          onClick={() => setShowCreatePoll(!showCreatePoll)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showCreatePoll ? 'Cancel' : 'Create Poll'}
        </button>
      </div>
      <p className="text-gray-600 mb-4">Subscribers: {subgroup.subscriberCount}</p>
      
      {showCreatePoll && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <input
            type="text"
            value={pollDescription}
            onChange={(e) => setPollDescription(e.target.value)}
            placeholder="Poll description"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="number"
            value={voteThreshold}
            onChange={(e) => setVoteThreshold(e.target.value)}
            placeholder="Vote threshold"
            className="w-full p-2 mb-2 border rounded"
          />
          <button
            onClick={handleCreatePoll}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Poll
          </button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Polls</h2>
        {proposals.map((proposal) => (
          <div key={proposal.id} className="border p-4 rounded">
            <p className="font-semibold">{proposal.description}</p>
            <p className="text-sm text-gray-600">
              Votes For: {proposal.votesFor} | Votes Against: {proposal.votesAgainst}
            </p>
            <div className="mt-2">
              <button
                onClick={() => handleVote(proposal.id, true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
              >
                Vote For
              </button>
              <button
                onClick={() => handleVote(proposal.id, false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Vote Against
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubgroupHeader;