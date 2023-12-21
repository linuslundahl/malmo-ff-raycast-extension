import React, { createContext } from "react";
import { useToggle } from "./hooks";

type StateContextType = {
  showDetails: boolean;
  setShowDetails: React.Dispatch<void>;
};

export const Context = createContext<StateContextType>({} as unknown as StateContextType);

export const ContextProvider = ({ children }: React.PropsWithChildren) => {
  const [showDetails, setShowDetails] = useToggle(false);

  return (
    <Context.Provider
      value={{
        showDetails,
        setShowDetails,
      }}
    >
      {children}
    </Context.Provider>
  );
};
