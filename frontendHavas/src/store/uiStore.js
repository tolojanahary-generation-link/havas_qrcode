import { create } from "zustand";

const useUiStore = create((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileSidebar: (open) => set({ mobileSidebarOpen: open }),
}));

export default useUiStore;
