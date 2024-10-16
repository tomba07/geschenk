import React, { createContext, useState, useContext, ReactNode } from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  setIsEditMode: () => { },
});

export const EditModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = (): EditModeContextType => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};
