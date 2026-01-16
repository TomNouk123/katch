<template>
  <div class="results-page" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @click="unmuteVideo">
    <div class="background">
      <div class="background__gradient" />
    </div>

    <div class="results-content" v-if="currentGroup">
      <!-- Fixed Header with Group Name -->
      <header class="header">
        <h1 class="group-name">{{ currentGroup.name }}</h1>
        <p class="header-subtitle">{{ isVideoMuted ? 'Tap to reveal song' : 'NOW PLAYING: ' + currentSongTitle }}</p>
      </header>

      <!-- Carousel for Main Cards Only -->
      <div class="carousel-container">
        <div class="carousel-track">
          <!-- Loop through all matched groups - only the main card -->
          <div 
            v-for="(groupId, index) in topMatchIds" 
            :key="groupId" 
            class="carousel-slide"
            :class="{
              'is-active': index === currentIndex,
              'is-prev': index === currentIndex - 1,
              'is-next': index === currentIndex + 1,
              'is-hidden': index < currentIndex - 1 || index > currentIndex + 1
            }"
            :style="{ transform: getSlideTransform(index) }"
          >
            <div class="main-card" v-if="getGroupById(groupId)">
              <!-- Video/Image Container (16:9 aspect ratio) -->
              <div class="video-container">
                <video 
                  v-if="getVideoConfig(groupId)" 
                  :ref="el => setVideoRef(el, groupId)"
                  class="group-video"
                  :src="getVideoConfig(groupId)?.src"
                  :autoplay="index === currentIndex"
                  muted
                  loop
                  playsinline
                  disablePictureInPicture
                  disableRemotePlayback
                />
                <img v-else :src="getGroupImage(getGroupById(groupId)?.image || '')" :alt="getGroupById(groupId)?.name" class="group-image" />
              </div>

              <!-- Info Section -->
              <div class="info-section">
                <h2 class="fandom-title">Fandom: {{ getGroupById(groupId)?.fandomName }}</h2>
                <p class="now-playing">{{ getGroupById(groupId)?.tags.join(', ').toUpperCase() }}</p>
                <p class="members-list">LEDEN: {{ getGroupById(groupId)?.members.map(m => m.name).join(', ') }}</p>
                <p class="company">COMPANY: {{ getGroupById(groupId)?.company }}</p>

                <!-- Description -->
                <p class="description">{{ getGroupById(groupId)?.description }}</p>
              </div>

              <!-- Lightstick positioned at bottom right with name -->
              <div class="lightstick-wrapper" v-if="getGroupById(groupId)?.lightstick">
                <p class="lightstick-name" v-if="getGroupById(groupId)?.lightstickName">LIGHTSTICK: {{ getGroupById(groupId)?.lightstickName }}</p>
                <div class="lightstick-container">
                  <img :src="getLightstickImage(getGroupById(groupId)?.lightstick || '')" :alt="getGroupById(groupId)?.lightstickName" class="lightstick-image" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Dots -->
      <div class="pagination-dots" v-if="topMatchIds.length > 1">
        <span 
          v-for="(groupId, index) in topMatchIds" 
          :key="groupId" 
          class="dot"
          :class="{ 'active': index === currentIndex }"
        ></span>
      </div>

      <!-- Fixed Bottom Section: QR Code, Replay Button, and NFC Hint -->
      <div class="bottom-section">
        <!-- QR Code on the left -->
        <div class="qr-section">
          <div class="qr-text">
            <span>Bezoek de</span>
            <span>spotify pagina</span>
          </div>
          <div class="qr-code">
            <img :src="getQrCode(currentGroup.qrCode || '')" :alt="'QR code for ' + currentGroup.name" />
          </div>
        </div>

        <!-- Replay Button in the middle -->
        <button class="replay-btn" @click="goToSplash">
          OPNIEUW SPELEN
        </button>

        <!-- NFC Hint on the right -->
        <div class="nfc-hint">
          <p class="nfc-text">Houd je telefoon<br/>hier tegenaan voor<br/>een leuke<br/>verrassing</p>
          <img :src="arrowIcon" alt="arrow" class="nfc-arrow" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading">
      <p>Je match wordt berekend...</p>
    </div>

    <!-- Idle Overlay -->
    <div v-if="showIdleOverlay" class="idle-overlay" @click.stop="dismissIdleOverlay" @touchstart.stop @touchmove.stop @touchend.stop>
      <div class="idle-overlay__bg"></div>
      <div class="idle-content">
        <h2 class="idle-title">Ben je er nog?</h2>
        <p class="idle-timer">{{ idleCountdown }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '@/store/_DataStore';
import kpopGroupsData from '@/assets/data/kpop-groups.json';
import { PageName } from '@/utils/_Constants';

// Import group videos
import akmuVideo from '@/assets/videos/akmu-howcanilove.mp4';
import ateezVideo from '@/assets/videos/ateez-crazyform.mp4';
import blackpinkVideo from '@/assets/videos/blackpink-jump.mp4';
import btsVideo from '@/assets/videos/bts-butter.mp4';
import day6Video from '@/assets/videos/day6-happy.mp4';
import dreamcatcherVideo from '@/assets/videos/dreamcatcher-boca.mp4';
import enhypenVideo from '@/assets/videos/enhypen-biteme.mp4';
import kissoflifeVideo from '@/assets/videos/kissoflife-igloo.mp4';
import lesserafimVideo from '@/assets/videos/lesserafim-hot.mp4';
import mamamooVideo from '@/assets/videos/mamamoo-starrynight.mp4';
import nct127Video from '@/assets/videos/nct127-factcheck.mp4';
import qwerVideo from '@/assets/videos/qwer-tbh.mp4';
import redvelvetVideo from '@/assets/videos/redvelvet-cosmic.mp4';
import straykidsVideo from '@/assets/videos/straykids-chkchkboom.mp4';
import theroseVideo from '@/assets/videos/therose-backtome.mp4';
import twiceVideo from '@/assets/videos/twice-thisisfor.mp4';
import xdinaryheroesVideo from '@/assets/videos/xdinaryheroes-fire.mp4';
import youngposseVideo from '@/assets/videos/youngposse-xxl.mp4';

// Import arrow icon
import arrowIcon from '@/assets/images/icons/arrow.png';

// Video configuration for all groups
const groupVideoConfig: Record<string, { src: string; startTime: number; songTitle: string }> = {
  akmu: { src: akmuVideo, startTime: 84, songTitle: 'How Can I Love the Heartbreak' },
  ateez: { src: ateezVideo, startTime: 60, songTitle: 'Crazy Form' },
  blackpink: { src: blackpinkVideo, startTime: 55, songTitle: 'Jump' },
  bts: { src: btsVideo, startTime: 29, songTitle: 'Butter' },
  day6: { src: day6Video, startTime: 56, songTitle: 'Happy' },
  dreamcatcher: { src: dreamcatcherVideo, startTime: 62, songTitle: 'BOCA' },
  enhypen: { src: enhypenVideo, startTime: 67, songTitle: 'Bite Me' },
  kissoflife: { src: kissoflifeVideo, startTime: 20, songTitle: 'Igloo' },
  lesserafim: { src: lesserafimVideo, startTime: 30, songTitle: 'Hot' },
  mamamoo: { src: mamamooVideo, startTime: 60, songTitle: 'Starry Night' },
  nct127: { src: nct127Video, startTime: 33, songTitle: 'Fact Check' },
  qwer: { src: qwerVideo, startTime: 70, songTitle: 'T.B.H' },
  redvelvet: { src: redvelvetVideo, startTime: 51, songTitle: 'Cosmic' },
  straykids: { src: straykidsVideo, startTime: 56, songTitle: 'Chk Chk Boom' },
  therose: { src: theroseVideo, startTime: 62, songTitle: 'Back To Me' },
  twice: { src: twiceVideo, startTime: 33, songTitle: 'This is For' },
  xdinaryheroes: { src: xdinaryheroesVideo, startTime: 24, songTitle: 'FiRE (My Sweet Misery)' },
  youngposse: { src: youngposseVideo, startTime: 90, songTitle: 'XXL' },
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
    const swipeOffset = ref(0);
    const isSwiping = ref(false);
    const minSwipeDistance = 50;
    
    // Video management - store refs for each group
    const videoRefs = ref<Record<string, HTMLVideoElement | null>>({});
    const videoInitialized = ref<Record<string, boolean>>({}); // Track if video start time was set
    const videoUnmuted = ref<Record<string, boolean>>({}); // Track unmuted state per group
    
    // Computed to check if current video is muted
    const isVideoMuted = computed(() => {
      return !videoUnmuted.value[currentGroupId.value];
    });
    
    // Set video ref for a specific group
    const setVideoRef = (el: any, groupId: string) => {
      if (el) {
        videoRefs.value[groupId] = el as HTMLVideoElement;
        // Only set start time once when video is first mounted
        if (!videoInitialized.value[groupId]) {
          const config = groupVideoConfig[groupId];
          if (config) {
            el.currentTime = config.startTime;
            el.volume = 0.15;
          }
          videoInitialized.value[groupId] = true;
        }
        // Restore unmuted state if previously unmuted
        if (videoUnmuted.value[groupId]) {
          el.muted = false;
          el.volume = 0.15;
        }
      }
    };
    
    // Unmute video on user interaction
    const unmuteVideo = () => {
      const currentVideo = videoRefs.value[currentGroupId.value];
      if (currentVideo && currentVideo.muted) {
        currentVideo.muted = false;
        currentVideo.volume = 0.15;
        videoUnmuted.value[currentGroupId.value] = true;
      }
    };
    
    const currentGroupId = computed(() => route.params.groupId as string);
    
    // Get group by ID helper
    const getGroupById = (groupId: string): KpopGroup | undefined => {
      return kpopGroupsData.groups.find(g => g.id === groupId) as KpopGroup | undefined;
    };
    
    // Get video config by group ID
    const getVideoConfig = (groupId: string) => {
      return groupVideoConfig[groupId] || null;
    };
    
    // Watch for group changes to handle video playback when swiping
    watch(currentGroupId, (newGroupId, oldGroupId) => {
      // Pause old video
      if (oldGroupId && videoRefs.value[oldGroupId]) {
        videoRefs.value[oldGroupId]?.pause();
      }
      
      // Play and set start time for new group's video if it exists
      setTimeout(() => {
        const config = groupVideoConfig[newGroupId];
        const currentVideo = videoRefs.value[newGroupId];
        if (currentVideo && config) {
          // Only reset to start time if not initialized
          if (!videoInitialized.value[newGroupId]) {
            currentVideo.currentTime = config.startTime;
            videoInitialized.value[newGroupId] = true;
          }
          currentVideo.volume = 0.15;
          // Restore unmuted state if previously unmuted
          if (videoUnmuted.value[newGroupId]) {
            currentVideo.muted = false;
          }
          currentVideo.play().catch(() => {});
        }
      }, 50);
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

    // Current group for fixed header and bottom section
    const currentGroup = computed<KpopGroup | undefined>(() => {
      return kpopGroupsData.groups.find(g => g.id === currentGroupId.value) as KpopGroup | undefined;
    });

    // Current song title for header
    const currentSongTitle = computed(() => {
      const config = groupVideoConfig[currentGroupId.value];
      return config ? config.songTitle : '';
    });

    const group = computed<KpopGroup | undefined>(() => {
      return kpopGroupsData.groups.find(g => g.id === currentGroupId.value) as KpopGroup | undefined;
    });

    const memberNames = computed(() => {
      if (!group.value) return '';
      return group.value.members.map(m => m.name).join(', ');
    });

    // Get current video config
    const currentVideoConfig = computed(() => {
      return groupVideoConfig[currentGroupId.value] || null;
    });

    // Now playing text based on group's video
    const nowPlayingText = computed(() => {
      const config = groupVideoConfig[currentGroupId.value];
      return config ? config.songTitle : '';
    });

    // Genres text for the group
    const genresText = computed(() => {
      if (!group.value) return '';
      return group.value.tags.join(', ').toUpperCase();
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
    
    const goToSplash = () => {
      store.clearTopMatchIds();
      router.push({ name: PageName.HOME });
    };
    
    // Idle screen functionality
    const IDLE_TIMEOUT = 15000; // 15 seconds before showing overlay
    const COUNTDOWN_DURATION = 15; // 15 second countdown
    
    const showIdleOverlay = ref(false);
    const idleCountdown = ref(COUNTDOWN_DURATION);
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let countdownInterval: ReturnType<typeof setInterval> | null = null;
    
    const resetIdleTimer = () => {
      // Clear existing timers
      if (idleTimer) clearTimeout(idleTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      
      // If overlay is showing, just dismiss it
      if (showIdleOverlay.value) {
        showIdleOverlay.value = false;
        idleCountdown.value = COUNTDOWN_DURATION;
      }
      
      // Start new idle timer
      idleTimer = setTimeout(() => {
        showIdleOverlay.value = true;
        idleCountdown.value = COUNTDOWN_DURATION;
        
        // Start countdown
        countdownInterval = setInterval(() => {
          idleCountdown.value--;
          
          if (idleCountdown.value <= 0) {
            // Time's up - go to splash screen
            if (countdownInterval) clearInterval(countdownInterval);
            goToSplash();
          }
        }, 1000);
      }, IDLE_TIMEOUT);
    };
    
    const dismissIdleOverlay = () => {
      resetIdleTimer();
    };
    
    // Set up activity listeners
    onMounted(() => {
      resetIdleTimer();
      
      // Listen for any interaction to reset the timer
      document.addEventListener('touchstart', resetIdleTimer);
      document.addEventListener('mousedown', resetIdleTimer);
      document.addEventListener('mousemove', resetIdleTimer);
      document.addEventListener('keydown', resetIdleTimer);
    });
    
    onUnmounted(() => {
      // Clean up timers and listeners
      if (idleTimer) clearTimeout(idleTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      
      document.removeEventListener('touchstart', resetIdleTimer);
      document.removeEventListener('mousedown', resetIdleTimer);
      document.removeEventListener('mousemove', resetIdleTimer);
      document.removeEventListener('keydown', resetIdleTimer);
    });
    
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
      touchEndX.value = e.touches[0].clientX;
      isSwiping.value = true;
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (!isSwiping.value) return;
      touchEndX.value = e.touches[0].clientX;
      
      // Calculate offset for visual feedback during swipe
      const diff = touchEndX.value - touchStartX.value;
      
      // Limit the offset at the edges
      const isAtStart = currentIndex.value === 0;
      const isAtEnd = currentIndex.value === topMatchIds.value.length - 1;
      
      if ((isAtStart && diff > 0) || (isAtEnd && diff < 0)) {
        // Apply resistance at edges
        swipeOffset.value = diff * 0.3;
      } else {
        swipeOffset.value = diff;
      }
    };
    
    const onTouchEnd = () => {
      isSwiping.value = false;
      
      if (!hasMultipleMatches.value) {
        swipeOffset.value = 0;
        return;
      }
      
      const distance = touchStartX.value - touchEndX.value;
      
      if (Math.abs(distance) < minSwipeDistance) {
        // Reset offset if swipe wasn't far enough
        swipeOffset.value = 0;
        return;
      }
      
      // Reset offset before navigation
      swipeOffset.value = 0;
      
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

    // Get transform for each slide based on position relative to current
    const getSlideTransform = (index: number) => {
      const offset = swipeOffset.value;
      const diff = index - currentIndex.value;
      
      if (diff === 0) {
        // Active card - centered with swipe offset
        return `translateX(calc(-50% + ${offset}px)) scale(1)`;
      } else if (diff === -1) {
        // Previous card - left side with swipe offset
        return `translateX(calc(-50% - 85% + ${offset}px)) scale(0.85)`;
      } else if (diff === 1) {
        // Next card - right side with swipe offset
        return `translateX(calc(-50% + 85% + ${offset}px)) scale(0.85)`;
      } else {
        // Hidden cards
        return `translateX(-50%) scale(0.85)`;
      }
    };

    return {
      currentGroupId,
      currentIndex,
      currentGroup,
      currentSongTitle,
      topMatchIds,
      hasMultipleMatches,
      canGoNext,
      canGoPrev,
      swipeOffset,
      isVideoMuted,
      arrowIcon,
      setVideoRef,
      getGroupById,
      getVideoConfig,
      getGroupImage,
      getLightstickImage,
      getQrCode,
      getSlideTransform,
      unmuteVideo,
      goHome,
      goToSplash,
      navigateToGroup,
      goToNext,
      goToPrev,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      showIdleOverlay,
      idleCountdown,
      dismissIdleOverlay,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/config/fonts';

.results-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #654EAC 0%, rgb(165, 145, 226) 50%, #654EAC 100%);
  touch-action: pan-x; // Only allow horizontal swipes, prevent vertical scroll
  overscroll-behavior: none; // Prevent pull-to-refresh and bounce effects
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
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: -42px;
  position: relative;
  z-index: 10;
  padding: 0 30px;
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: visible;
  z-index: 1;
}

.carousel-track {
  position: relative;
  width: 100%;
  min-height: 780px;
}

.carousel-slide {
  position: absolute;
  width: calc(100vw - 60px);
  max-width: calc(100vw - 60px);
  left: 50%;
  transition: transform 0.4s ease-out, opacity 0.4s ease-out;
  opacity: 0.7;
  z-index: 1;
  
  // Position for previous card (left peek)
  &.is-prev {
    opacity: 0.7;
    z-index: 1;
  }
  
  // Position for next card (right peek)
  &.is-next {
    opacity: 0.7;
    z-index: 1;
  }
  
  // Active card: centered and full size
  &.is-active {
    opacity: 1;
    z-index: 3;
  }
  
  // Hide cards that are not adjacent
  &.is-hidden {
    opacity: 0;
    pointer-events: none;
  }
}

.group-name {
  font-family: 'Outfit', sans-serif;
  font-size: 80px;
  font-weight: 1000;
  color: #fff;
  margin-bottom: -12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}

.header-subtitle {
  font-family: 'Mulish', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin: 6px 0 0px 0;
  line-height: 1;
}

.main-card {
  background: #fff;
  border-radius: 71px;
  border-style: hidden;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
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
  padding: 20px 28px 100px;
  margin-top: -32px;
  position: relative;
  z-index: 1;
}

.fandom-title {
  font-family: 'Mulish', sans-serif;
  font-size: 38px;
  font-weight: 1000;
  color: #594A4E;
  margin: 30px 0 -8px 10px;
}

.now-playing {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 1000;
  color: #594A4E;
  margin: 0 0 18px 10px;
  line-height: 1;
}

.members-list {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #594A4E;
  margin: 0 0 4px 10px;
  line-height: 1;
}

.company {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 600;
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
  right: -10px;
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
  width: 210px;
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  
  .lightstick-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.pagination-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0 15px 0;
  position: relative;
  z-index: 10;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: background 0.3s ease, transform 0.3s ease;
  
  &.active {
    background: #fff;
    transform: scale(1.2);
  }
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  padding: 0 50px;
  box-sizing: border-box;
  margin-top: 0px;
  position: relative;
  z-index: 10;
}

.qr-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
}

.qr-code {
  width: 160px;
  height: 160px;
  background: #fff;
  border-radius: 14px;
  padding: 10px;
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
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.replay-btn {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #fff;
  border-radius: 25px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateX(-50%) scale(0.95);
  }
}

.nfc-hint {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.nfc-text {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 700;
  font-style: italic;
  color: #fff;
  text-align: right;
  line-height: 1;
  margin: 0;
}

.nfc-arrow {
  width: 100px;
  height: auto;
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

// Idle overlay styles
.idle-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  // Prevent any layout shifts
  pointer-events: auto;
}

.idle-overlay__bg {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
}

.idle-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.idle-title {
  font-family: 'Outfit', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-align: center;
}

.idle-timer {
  font-family: 'Outfit', sans-serif;
  font-size: 120px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1;
}
</style>
