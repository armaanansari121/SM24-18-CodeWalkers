"use client"; 
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import CreateSubgroupModal from './CreateSubgroupModal'; // Make sure to create this component
import { useContract } from '../_contexts/ContractContext';

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {contract,account}=useContract();

  // Mock data for subscribed groups
  const subscribedGroups = [
    { id: 1, name: 'Tech Enthusiasts', icon: '💻' },
    { id: 2, name: 'Crypto Traders', icon: '💰' },
    { id: 3, name: 'Art & Design', icon: '🎨' },
    { id: 4, name: 'Fitness Freaks', icon: '💪' },
  ];

  const handleCreateSubgroup = async (name: string) => {
    // Here you would call the contract function
    await contract.methods.createSubgroup(name).send({ from: account });
    console.log(`Creating subgroup: ${name}`);
    // You'd need to integrate with your web3 library here to call the contract function
    // For example: contract.methods.createSubgroup(name).send({ from: userAddress })
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="w-64 bg-slate-100 shadow-md h-screen flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <Image src="/logo.png" alt="Platform Logo" width={900} height={40} quality={100} />
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <Link href="/" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <div className="mt-8">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Subscribed Groups
            </h3>
            <ul>
              {subscribedGroups.map((group) => (
                <li key={group.id}>
                  <Link href={`/subgroups/${group.id}`} className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200">
                    <span className="mr-3 text-xl">{group.icon}</span>
                    {group.name}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-[1/2] ml-10 mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Create Subgroup
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link href="/profile" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </div>
      </div>

      <CreateSubgroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubgroup}
      />
    </>
  );
};

export default Sidebar;