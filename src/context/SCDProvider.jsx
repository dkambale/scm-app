// src/contexts/SCDProvider.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScdData } from '../store/scdSlice';

const SCDContext = createContext();

export const useSCDData = () => {
  const context = useContext(SCDContext);
  if (!context) {
    throw new Error('useSCDData must be used within a SCDProvider');
  }
  return context;
};

export const SCDProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { schools, classes, divisions, loading, error } = useSelector((state) => state.scd);

  useEffect(() => {
    dispatch(fetchScdData());
  }, [dispatch]);

  const value = { schools, classes, divisions, loading, error };

  return <SCDContext.Provider value={value}>{children}</SCDContext.Provider>;
};