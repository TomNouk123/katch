import { defineStore } from 'pinia';

export const useDataStore = defineStore('data', {
  state: () => {
    return {
      likedArtists: [] as string[],
    };
  },
  actions: {
    setLikedArtists(artistIds: string[]) {
      this.likedArtists = artistIds;
    },
    clearLikedArtists() {
      this.likedArtists = [];
    },
  },
  getters: {},
});
