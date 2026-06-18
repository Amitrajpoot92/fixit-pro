// src/context/TabVisibilityContext.js
import React, { createContext, useState, useContext } from 'react';

const TabVisibilityContext = createContext();

export const TabVisibilityProvider = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  return (
    <TabVisibilityContext.Provider value={{ isTabBarVisible, setIsTabBarVisible }}>
      {children}
    </TabVisibilityContext.Provider>
  );
};

export const useTabVisibility = () => useContext(TabVisibilityContext);