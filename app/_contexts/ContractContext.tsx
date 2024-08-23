"use client";

import React, { createContext, useState, useContext } from 'react';

interface ContractContextType {
  contract: string;
  setContract: (contract: string) => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState('');

  return (
    <ContractContext.Provider value={{contract,setContract}}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};