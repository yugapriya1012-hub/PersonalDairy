import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lifeos_user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return {
      name: 'John Doe',
      email: 'john@lifeos.ai',
      bio: 'Productivity enthusiast.',
      avatar: 'J'
    };
  });

  useEffect(() => {
    localStorage.setItem('lifeos_user', JSON.stringify(user));
  }, [user]);

  const updateUser = (updates) => {
    setUser(prev => ({
      ...prev,
      ...updates,
      avatar: updates.name ? updates.name.charAt(0).toUpperCase() : prev.avatar
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
