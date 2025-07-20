import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const useLayOutStore = create(
    persist(
        (set) => ({
            activeTab: 'chats',
            selectedContact: null,
            setSelectedContact: (contact) => set({selectedContact:contact}),
            setActiveTab: (tab) => set({activeTab:tab})
        }),
        {
            name: "layout-storage",
             getStorage: () => localStorage
        }
    )
);


export default useLayOutStore;