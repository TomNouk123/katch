<template>
  <div class="results-page" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
    <div class="results-content" v-if="group">
      <!-- Header with dots -->
      <header class="header">
        <div class="page-dots" v-if="hasMultipleMatches">
          <span 
            v-for="(groupId, index) in topMatchIds" 
            :key="groupId" 
            class="dot"
            :class="{ active: currentGroupId === groupId }"
            @click="navigateToGroup(groupId)"
          ></span>
        </div>
        <h1 class="header__title" v-else>Jouw K-pop match!</h1>
      </header>

      <!-- Group Card with Image + Black Info Section -->
      <div class="group-card">
        <!-- Group Image -->
        <div class="group-image">
          <img :src="getGroupImage(group.image)" :alt="group.name" />
          <div class="group-image__gradient" />
        </div>
        
        <!-- Black Info Section -->
        <div class="group-info">
          <h2 class="group-name">{{ group.name }}</h2>
          <p class="group-members">{{ memberNames }}</p>
          <p class="group-company">COMPANY: {{ group.company }}</p>
          <p class="group-description">{{ group.description }}</p>

          <!-- Spotify Button -->
          <a :href="group.spotifyUrl" target="_blank" class="spotify-btn">
            <div class="spotify-qr">
              <img :src="getQrCode(group.qrCode)" :alt="group.qrCode" class="codeqr"/>
            </div>
            <div class="spotify-text">
              <span>Bezoek de</span>
              <span>spotify pagina</span>
            </div>
          </a>

          <!-- Members Section -->
          <div class="members-section">
            <h3 class="members-title">LEDEN</h3>
            
            <div class="members-list">
              <div 
                v-for="member in group.members" 
                :key="member.name"
                class="member-card"
              >
                <div class="member-image">
                  <img :src="getMemberImage(member.image)" :alt="member.name" />
                </div>
                <div class="member-info">
                  <h4 class="member-name">{{ member.name.toUpperCase() }} <span class="member-name-kr">({{ member.nameKr }})</span></h4>
                  <p class="member-role">{{ member.role }}</p>
                  <p class="member-description">{{ member.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Replay Button -->
      <button class="replay-btn" @click="goHome">
        Opnieuw spelen
      </button>
    </div>

    <!-- Loading State -->
    <div v-else class="loading">
      <p>Je match wordt berekend...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '@/store/_DataStore';
import kpopGroupsData from '@/assets/data/kpop-groups.json';
import { PageName } from '@/utils/_Constants';

// Import group songs
import blackpinkSong from '@/assets/music/blackpink.mp3';
import twiceSong from '@/assets/music/twice.mp3';
import lesserafimSong from '@/assets/music/lesserafim.mp3';

// Music configuration for groups
const groupMusicConfig: Record<string, { src: string; startTime: number }> = {
  blackpink: { src: blackpinkSong, startTime: 30 },
  twice: { src: twiceSong, startTime: 35 },
  lesserafim: { src: lesserafimSong, startTime: 60 },
};

interface Member {
  name: string;
  nameKr: string;
  role: string;
  image: string;
  description: string;
}

interface KpopGroup {
  id: string;
  name: string;
  nameKr: string;
  color: string;
  company: string;
  description: string;
  spotifyUrl: string;
  image: string;
  qrCode: string;
  tags: string[];
  members: Member[];
}

// Import all kpop group images
const groupImages = import.meta.glob('@/assets/images/kpop-groups/**/*', { eager: true, as: 'url' });
const qrImages = import.meta.glob('@/assets/images/qrcodes/**/*', { eager: true, as: 'url' });

export default defineComponent({
  name: 'ResultsPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useDataStore();
    
    // Touch handling for swipe
    const touchStartX = ref(0);
    const touchEndX = ref(0);
    const minSwipeDistance = 50;
    
    // Audio management
    const audioRef = ref<HTMLAudioElement | null>(null);
    const currentMusicGroup = ref<string | null>(null);
    
    const currentGroupId = computed(() => route.params.groupId as string);
    
    // Check if current group has music
    const groupHasMusic = computed(() => currentGroupId.value in groupMusicConfig);
    
    // Function to play group's song
    const playGroupSong = (groupId: string) => {
      const config = groupMusicConfig[groupId];
      if (!config) return;
      
      // If switching to a different song, create new audio element
      if (currentMusicGroup.value !== groupId) {
        if (audioRef.value) {
          audioRef.value.pause();
        }
        audioRef.value = new Audio(config.src);
        audioRef.value.volume = 0.7;
        currentMusicGroup.value = groupId;
      }
      
      if (audioRef.value) {
        audioRef.value.currentTime = config.startTime;
        audioRef.value.play().catch(err => {
          console.log('Audio playback failed:', err);
        });
      }
    };
    
    // Function to stop the song
    const stopSong = () => {
      if (audioRef.value) {
        audioRef.value.pause();
      }
    };
    
    // Watch for changes in the current group
    watch(currentGroupId, (newGroupId) => {
      if (newGroupId && newGroupId in groupMusicConfig) {
        playGroupSong(newGroupId);
      } else {
        stopSong();
      }
    }, { immediate: true });
    
    onMounted(() => {
      // If already on a page with music, start playing
      if (groupHasMusic.value) {
        playGroupSong(currentGroupId.value);
      }
    });
    
    onUnmounted(() => {
      // Clean up audio when leaving the page
      if (audioRef.value) {
        audioRef.value.pause();
        audioRef.value = null;
      }
    });
    
    const topMatchIds = computed(() => store.topMatchIds);
    
    const hasMultipleMatches = computed(() => topMatchIds.value.length > 1);

    const group = computed<KpopGroup | undefined>(() => {
      return kpopGroupsData.groups.find(g => g.id === currentGroupId.value) as KpopGroup | undefined;
    });

    const memberNames = computed(() => {
      if (!group.value) return '';
      return group.value.members.map(m => m.name.toUpperCase()).join(', ');
    });
    
    const currentIndex = computed(() => {
      return topMatchIds.value.indexOf(currentGroupId.value);
    });

    const getGroupImage = (imagePath: string) => {
      for (const [key, url] of Object.entries(groupImages)) {
        if (key.includes(imagePath)) {
          return url;
        }
      }
      return '';
    };

    const getQrCode = (imagePath: string) => {
      for (const [key, url] of Object.entries(qrImages)) {
        if (key.includes(imagePath)) {
          return url;
        }
      }
      return '';
    };

    const getMemberImage = (imagePath: string) => {
      for (const [key, url] of Object.entries(groupImages)) {
        if (key.includes(imagePath)) {
          return url;
        }
      }
      return '';
    };

    const goHome = () => {
      store.clearTopMatchIds();
      router.push({ name: PageName.HOME });
    };
    
    const navigateToGroup = (groupId: string) => {
      router.replace({ name: PageName.RESULTS, params: { groupId } });
    };
    
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.value = e.touches[0].clientX;
    };
    
    const onTouchMove = (e: TouchEvent) => {
      touchEndX.value = e.touches[0].clientX;
    };
    
    const onTouchEnd = () => {
      if (!hasMultipleMatches.value) return;
      
      const distance = touchStartX.value - touchEndX.value;
      
      if (Math.abs(distance) < minSwipeDistance) return;
      
      if (distance > 0) {
        // Swipe left - go to next
        const nextIndex = currentIndex.value + 1;
        if (nextIndex < topMatchIds.value.length) {
          navigateToGroup(topMatchIds.value[nextIndex]);
        }
      } else {
        // Swipe right - go to previous
        const prevIndex = currentIndex.value - 1;
        if (prevIndex >= 0) {
          navigateToGroup(topMatchIds.value[prevIndex]);
        }
      }
    };

    return {
      group,
      memberNames,
      currentGroupId,
      topMatchIds,
      hasMultipleMatches,
      getGroupImage,
      getQrCode,
      getMemberImage,
      goHome,
      navigateToGroup,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/config/fonts';

.results-page {
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
}

.results-content {
  width: 100%;
  padding: 50px;
}

.header {
  text-align: center;
  margin-bottom: 32px;

  &__title {
    font-family: 'Outfit', sans-serif;
    font-size: 42px;
    font-weight: 600;
    font-style: italic;
    color: #8b5cf6;
    margin: 0;
  }
}

.page-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px 0;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d4d4d8;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.active {
    background: #8b5cf6;
    transform: scale(1.2);
  }
  
  &:hover:not(.active) {
    background: #a78bfa;
  }
}

.group-card {
  width: 100%;
  border-radius: 45px;
  overflow: hidden;
  margin-bottom: 24px;
}

.group-image {
  width: 100%;
  height: 700px;
  position: relative;
  line-height: 0;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__gradient {
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 350px;
    background: linear-gradient(to bottom, transparent 0%, #000 100%);
  }
}

.group-info {
  background: #000;
  padding: 24px 24px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.group-name {
  font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
  font-size: 80px;
  font-weight: 700;
  color: #fff;
  margin: -50px 0 4px 0;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  z-index: 999;
}

.group-members {
  font-family: 'Mulish', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
  max-width: 90%;
}

.group-company {
  font-family: 'Mulish', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 24px 0;
  letter-spacing: 0.5px;
}

.group-description {
  font-family: 'Mulish', sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #fff;
  margin: 0 auto;
  line-height: 1.4;
  text-align: center;
  max-width: 90%;
  padding: 0 20px;
}

.spotify-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-decoration: none;
  margin: 32px auto 48px;
  text-align: left;
}

.spotify-qr {
  flex-shrink: 0;

  .qr-placeholder {
    width: 100px;
    height: 100px;
    background: #fff;
    border-radius: 8px;
    // QR code pattern simulation
    background-image: 
      linear-gradient(45deg, #000 25%, transparent 25%),
      linear-gradient(-45deg, #000 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #000 75%),
      linear-gradient(-45deg, transparent 75%, #000 75%);
    background-size: 10px 10px;
    background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  }

  .codeqr {
    width: 200px;
    height: 200px;
    background: #fff;
    border-radius: 8px;
  }
}

.spotify-text {
  display: flex;
  flex-direction: column;
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.members-section {
  text-align: left;
  max-width: 95%;
  margin: 0 auto;
  padding: 0 20px;
}

.members-title {
  font-family: 'Mulish', sans-serif;
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 36px 0;
  letter-spacing: 1px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.member-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.member-image {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.member-info {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.member-name {
  font-family: 'Mulish', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 4px 0;
}

.member-name-kr {
  font-family: 'Mulish', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.member-role {
  font-family: 'Mulish', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: -8px 0 12px 0;
  letter-spacing: 0.3px;
}

.member-description {
  font-family: 'Mulish', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #fff;
  margin: 0;
  line-height: 1.6;
}

.replay-btn {
  width: 100%;
  background: #8b5cf6;
  border: none;
  border-radius: 30px;
  padding: 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #7c3aed;
    transform: translateY(-2px);
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  
  p {
    font-family: 'Mulish', sans-serif;
    font-size: 18px;
    color: #333;
  }
}
</style>
