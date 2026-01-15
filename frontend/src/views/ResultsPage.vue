<template>
  <div class="results-page" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @click="unmuteVideo">
    <div class="background">
      <div class="background__gradient" />
    </div>

    <div class="results-content" v-if="group">
      <!-- Header with Group Name -->
      <header class="header">
        <h1 class="group-name">{{ group.name }}</h1>
      </header>

      <!-- Main Card -->
      <div class="main-card">
        <!-- Video/Image Container (16:9 aspect ratio) -->
        <div class="video-container">
          <video 
            v-if="currentGroupId === 'lesserafim'" 
            ref="videoRef"
            class="group-video"
            :src="lesserafimVideo"
            autoplay
            muted
            loop
            playsinline
            disablePictureInPicture
            disableRemotePlayback
          />
          <img v-else :src="getGroupImage(group.image)" :alt="group.name" class="group-image" />
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <h2 class="fandom-title">Fandom: {{ group.fandomName }}</h2>
          <p class="now-playing">NOW PLAYING: {{ nowPlayingText }}</p>
          <p class="members-list">LEDEN: {{ memberNames }}</p>
          <p class="company">COMPANY: {{ group.company }}</p>

          <!-- Description -->
          <p class="description">{{ group.description }}</p>
        </div>

        <!-- Lightstick positioned at bottom right with name -->
        <div class="lightstick-wrapper" v-if="group.lightstick">
          <p class="lightstick-name" v-if="group.lightstickName">LIGHTSTICK: {{ group.lightstickName }}</p>
          <div class="lightstick-container">
            <img :src="getLightstickImage(group.lightstick)" :alt="group.lightstickName" class="lightstick-image" />
          </div>
        </div>
      </div>

      <!-- Bottom Section: QR Code and NFC Hint side by side -->
      <div class="bottom-section">
        <!-- QR Code on the left -->
        <div class="qr-section">
          <div class="qr-code">
            <img :src="getQrCode(group.qrCode)" :alt="'QR code for ' + group.name" />
          </div>
          <div class="qr-text">
            <span>Bezoek de</span>
            <span>spotify pagina</span>
          </div>
        </div>

        <!-- NFC Hint on the right -->
        <div class="nfc-hint">
          <p class="nfc-text">Houd je telefoon<br/>hier tegenaan voor<br/>een leuke<br/>verrassing</p>
          <svg class="nfc-arrow" viewBox="0 0 100 50" width="60" height="30">
            <path 
              d="M10 25 Q 50 25, 70 40" 
              stroke="currentColor" 
              stroke-width="3" 
              fill="none"
              stroke-linecap="round"
            />
            <path 
              d="M60 42 L70 40 L68 30" 
              stroke="currentColor" 
              stroke-width="3" 
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
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

// Import group videos
import lesserafimVideo from '@/assets/videos/lesserafim-hot.mp4';

// Music configuration for groups (LE SSERAFIM uses video audio instead)
const groupMusicConfig: Record<string, { src: string; startTime: number; songTitle: string; artist: string }> = {
  blackpink: { src: blackpinkSong, startTime: 30, songTitle: 'Jump', artist: 'BLACKPINK' },
  twice: { src: twiceSong, startTime: 35, songTitle: 'The Feels', artist: 'TWICE' },
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
  fandomName: string;
  description: string;
  spotifyUrl: string;
  image: string;
  qrCode: string;
  lightstick?: string;
  lightstickName?: string;
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
    
    // Video management
    const videoRef = ref<HTMLVideoElement | null>(null);
    
    // Unmute video on user interaction
    const unmuteVideo = () => {
      if (videoRef.value && videoRef.value.muted) {
        videoRef.value.muted = false;
        videoRef.value.volume = 0.15;
      }
    };
    
    const currentGroupId = computed(() => route.params.groupId as string);
    
    // Function to play group's song
    const playGroupSong = (groupId: string) => {
      const config = groupMusicConfig[groupId];
      if (!config) return;
      
      // Always stop current audio first
      if (audioRef.value) {
        audioRef.value.pause();
        audioRef.value = null;
      }
      
      // Create new audio element for this group
      audioRef.value = new Audio(config.src);
      audioRef.value.volume = 0.7;
      audioRef.value.currentTime = config.startTime;
      currentMusicGroup.value = groupId;
      
      audioRef.value.play().catch(err => {
        console.log('Audio playback failed:', err);
      });
    };
    
    // Function to stop the song
    const stopSong = () => {
      if (audioRef.value) {
        audioRef.value.pause();
        audioRef.value = null;
      }
      currentMusicGroup.value = null;
    };
    
    // Watch for changes in the current group
    watch(currentGroupId, (newGroupId) => {
      if (newGroupId && newGroupId in groupMusicConfig) {
        playGroupSong(newGroupId);
      } else {
        stopSong();
      }
    });
    
    onMounted(() => {
      // Start playing if current group has music
      const groupId = currentGroupId.value;
      if (groupId && groupId in groupMusicConfig) {
        playGroupSong(groupId);
      }
      
      // Set video start time for LE SSERAFIM
      if (groupId === 'lesserafim' && videoRef.value) {
        videoRef.value.currentTime = 30;
      }
    });
    
    // Watch for video ref to set start time
    watch(videoRef, (newVideoRef) => {
      if (newVideoRef && currentGroupId.value === 'lesserafim') {
        newVideoRef.currentTime = 30;
        newVideoRef.volume = 0.15;
      }
    });
    
    onUnmounted(() => {
      // Clean up audio when leaving the page
      stopSong();
    });
    
    const topMatchIds = computed(() => store.topMatchIds);
    
    const hasMultipleMatches = computed(() => topMatchIds.value.length > 1);
    
    const currentIndex = computed(() => {
      return topMatchIds.value.indexOf(currentGroupId.value);
    });
    
    const canGoNext = computed(() => {
      return currentIndex.value < topMatchIds.value.length - 1;
    });
    
    const canGoPrev = computed(() => {
      return currentIndex.value > 0;
    });
    
    const goToPrev = () => {
      const prevIndex = currentIndex.value - 1;
      if (prevIndex >= 0) {
        navigateToGroup(topMatchIds.value[prevIndex]);
      }
    };

    const group = computed<KpopGroup | undefined>(() => {
      return kpopGroupsData.groups.find(g => g.id === currentGroupId.value) as KpopGroup | undefined;
    });

    const memberNames = computed(() => {
      if (!group.value) return '';
      return group.value.members.map(m => m.name).join(', ');
    });

    // Now playing text based on group
    const nowPlayingText = computed(() => {
      if (currentGroupId.value === 'lesserafim') return 'Hot';
      return 'This is For';
    });

    // Calculate dynamic font size based on name length
    const groupNameFontSize = computed(() => {
      if (!group.value) return '88px';
      const nameLength = group.value.name.length;
      // Scale font size inversely with name length
      // Short names (4-5 chars like "TWICE", "BTS") get 88px
      // Long names (14+ chars like "Xdinary Heroes") get smaller
      if (nameLength <= 5) return '88px';
      if (nameLength <= 7) return '72px';
      if (nameLength <= 10) return '58px';
      if (nameLength <= 13) return '48px';
      return '42px';
    });

    const getGroupImage = (imagePath: string) => {
      for (const [key, url] of Object.entries(groupImages)) {
        if (key.includes(imagePath)) {
          return url;
        }
      }
      return '';
    };

    const getLightstickImage = (imagePath: string) => {
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

    const goHome = () => {
      store.clearTopMatchIds();
      router.push({ name: PageName.HOME });
    };
    
    const navigateToGroup = (groupId: string) => {
      router.replace({ name: PageName.RESULTS, params: { groupId } });
    };
    
    const goToNext = () => {
      const nextIndex = currentIndex.value + 1;
      if (nextIndex < topMatchIds.value.length) {
        navigateToGroup(topMatchIds.value[nextIndex]);
      }
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
      canGoNext,
      canGoPrev,
      groupNameFontSize,
      nowPlayingText,
      videoRef,
      lesserafimVideo,
      unmuteVideo,
      getGroupImage,
      getLightstickImage,
      getQrCode,
      goHome,
      navigateToGroup,
      goToNext,
      goToPrev,
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
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
}

.background {
  position: fixed;
  inset: 0;
  z-index: 0;
  
  &__gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #654EAC 0%, rgb(165, 145, 226) 50%, #654EAC 100%);
  }
}

.results-content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 40px 50px;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -20px;
  position: relative;
  z-index: 2;
}

.group-name {
  font-family: 'Outfit', sans-serif;
  font-size: 80px;
  font-weight: 1000;
  color: #fff;
  margin-bottom: -12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.main-card {
  background: #fff;
  border-radius: 71px;
  border-style: hidden;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-bottom: 40px;
  max-width: 96%;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #fff;
  overflow: hidden;
  position: relative;
  
  .group-image,
  .group-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    pointer-events: none; // Disable all interaction with video
  }
}


.info-section {
  padding: 20px 28px 150px;
  margin-top: -40px;
  position: relative;
  z-index: 1;
}

.fandom-title {
  font-family: 'Mulish', sans-serif;
  font-size: 38px;
  font-weight: 1000;
  color: #594A4E;
  margin: 30px 0 -4px 10px;
}

.now-playing {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #594A4E;
  margin: 0 0 14px 10px;
  line-height: 1;
}

.members-list {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #594A4E;
  margin: 0 0 4px 10px;
  line-height: 1;
}

.company {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #594A4E;
  margin: 0 0 20px 10px;
}

.description-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.description {
  font-family: 'Mulish', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #594A4E;
  margin: 0 0 0 10px;
  line-height: 1.3;
  max-width: 70%;
}

.lightstick-wrapper {
  position: absolute;
  bottom: 0px;
  right: -20px;
  display: flex;
  align-items: flex-end;
  gap: 0px;
}

.lightstick-name {
  font-family: 'Mulish', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #594A4E;
  margin: 0 -40px 20px 0;
  text-align: right;
  white-space: nowrap;
}

.lightstick-container {
  width: 230px;
  height: 270px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  
  .lightstick-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.qr-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.qr-code {
  width: 140px;
  height: 140px;
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.qr-text {
  display: flex;
  flex-direction: column;
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
}

.nfc-hint {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.nfc-text {
  font-family: 'Mulish', sans-serif;
  font-size: 16px;
  font-weight: 600;
  font-style: italic;
  color: #fff;
  text-align: right;
  line-height: 1.3;
  margin: 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
}

.nfc-arrow {
  color: #fff;
  flex-shrink: 0;
}

.loading {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  
  p {
    font-family: 'Mulish', sans-serif;
    font-size: 18px;
    color: #fff;
  }
}
</style>
