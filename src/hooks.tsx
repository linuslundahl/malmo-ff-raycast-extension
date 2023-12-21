import { Dispatch, SetStateAction, useCallback, useContext, useState } from "react";
import { Context } from "./context";

export function useToggle(defaultValue?: boolean): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState(!!defaultValue);
  const toggle = useCallback(() => setValue((x) => !x), []);
  return [value, toggle, setValue];
}

export const useAppContext = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useAppContext was used outside of its Provider");
  }

  return context;
};
