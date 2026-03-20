import { useCallback, useState } from 'react';

export const useSettingsMenuState = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  return {
    menuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  };
};
