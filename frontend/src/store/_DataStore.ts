import { defineStore } from 'pinia';

export const useDataStore = defineStore('data', {
  state: () => {
    return {
      likedArtists: [] as string[],
      topMatchIds: [] as string[],
    };
  },
  actions: {
    setLikedArtists(artistIds: string[]) {
      this.likedArtists = artistIds;
    },
    clearLikedArtists() {
      this.likedArtists = [];
    },
    setTopMatchIds(groupIds: string[]) {
      this.topMatchIds = groupIds;
    },
    clearTopMatchIds() {
      this.topMatchIds = [];
    },
  },
  getters: {},
});
