<template>
  <div class="swipe-game">
    <!-- Card Stack Container -->
    <div class="card-container">
      <div class="card-stack">
        <!-- Stacked Cards -->
        <div
          v-for="(artist, index) in visibleCards"
          :key="artist.id"
          class="card"
          :class="{ 
            'card--active': index === 0,
            'card--second': index === 1,
            'card--third': index === 2
          }"
          :style="getCardStyle(index)"
          @touchstart="index === 0 && !showIntro ? onTouchStart($event) : null"
          @touchmove="index === 0 && !showIntro ? onTouchMove($event) : null"
          @touchend="index === 0 && !showIntro ? onTouchEnd() : null"
          @mousedown="index === 0 && !showIntro ? onMouseDown($event) : null"
        >
          <div class="card__image" :style="{ backgroundImage: `url(${getImageUrl(artist.image)})` }">
            <!-- Gradient overlay for text readability -->
            <div class="card__gradient" />
            
            <!-- Content overlaying the image -->
            <div class="card__content">
              <h2 class="card__name">{{ artist.name }}</h2>
              <p class="card__genres">{{ artist.genres }}</p>
              <p class="card__description">{{ artist.description }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons inside card-stack -->
        <button class="action-btn action-btn--nope" @click="!showIntro && swipeLeft()">
          <span class="action-btn__icon">✕</span>
        </button>
        <button class="action-btn action-btn--like" @click="!showIntro && swipeRight()">
          <img src="@/assets/images/like.png" alt="Like" class="action-btn__icon" />
        </button>
        
        <!-- Progress -->
        <div class="progress">
          <span class="progress__text">{{ currentIndex }}/{{ totalCards }}</span>
        </div>
      </div>
    </div>

    <!-- Intro Overlay -->
    <div v-if="showIntro" class="intro-overlay">
      <div class="intro-overlay__bg"></div>
      
      <!-- Top instruction text -->
      <div class="intro-instruction intro-instruction--top">
        <p>Wij gaan op zoek naar jouw<br/>Kpop match! We moeten eerst<br/>alleen even weten wat jouw<br/>muziek smaak is!</p>
      </div>

      <!-- Left instruction (pointing to X button) -->
      <div class="intro-instruction intro-instruction--left">
        <p>Swipe de artiesten gebaseerd op<br/>of je ze leuk vindt of niet</p>
        <img src="@/assets/images/icons/arrow.png" alt="" class="intro-arrow intro-arrow--down-left" />
      </div>

      <!-- Right instruction (pointing to heart button) -->
      <div class="intro-instruction intro-instruction--right">
        <p>Ken je de artiest niet? Geen<br/>zorgen, swipe dan op basis van<br/>de genres of het liedje dat je<br/>hoort!</p>
        <img src="@/assets/images/icons/arrow.png" alt="" class="intro-arrow intro-arrow--down-right" />
      </div>

      <!-- Start Button -->
      <button class="intro-start-btn" @click="dismissIntro">
        START
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import artistData from '@/assets/data/western-artists.json';
import { PageName } from '@/utils/_Constants';
import { useDataStore } from '@/store/_DataStore';

interface Artist {
  id: string;
  name: string;
  genres: string;
  description: string;
  image: string;
}

// Import all western artist images
const imageModules = import.meta.glob('@/assets/images/western-artists/*', { eager: true, as: 'url' });

// Number of artists per game
const ARTISTS_PER_GAME = 25;

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random selection of artists
function getRandomArtists(allArtists: Artist[], count: number): Artist[] {
  const shuffled = shuffleArray(allArtists);
  return shuffled.slice(0, count);
}

export default defineComponent({
  name: 'SwipeGame',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useDataStore();
    
    // Show intro overlay (check if coming from intro page)
    const showIntro = ref(route.query.intro !== 'false');
    
    const dismissIntro = () => {
      showIntro.value = false;
    };
    
    // Clear previous liked artists when starting a new game
    store.clearLikedArtists();
    
    // Get 20 random artists from the pool of 26
    const artists = ref<Artist[]>(getRandomArtists(artistData.artists as Artist[], ARTISTS_PER_GAME));
    const likedArtists = ref<string[]>([]);
    const currentIndex = ref(0);
    const totalCards = ARTISTS_PER_GAME;

    // Swipe state
    const startX = ref(0);
    const startY = ref(0);
    const currentX = ref(0);
    const isDragging = ref(false);

    const visibleCards = computed(() => {
      return artists.value.slice(0, 3);
    });

    const dragDistance = computed(() => currentX.value - startX.value);

    const likeOpacity = computed(() => {
      if (!isDragging.value) return 0;
      return Math.min(Math.max(dragDistance.value / 100, 0), 1);
    });

    const nopeOpacity = computed(() => {
      if (!isDragging.value) return 0;
      return Math.min(Math.max(-dragDistance.value / 100, 0), 1);
    });

    const getImageUrl = (filename: string) => {
      for (const [key, url] of Object.entries(imageModules)) {
        if (key.includes(filename)) {
          return url;
        }
      }
      return '';
    };

    // Predefined rotations for stacked effect
    const stackRotations = [0, 4, -3];

    const getCardStyle = (index: number) => {
      const baseRotation = stackRotations[index] || 0;
      
      if (index === 0 && isDragging.value) {
        const rotate = dragDistance.value * 0.08;
        return {
          transform: `translate(calc(-50% + ${dragDistance.value}px), -50%) rotate(${rotate}deg)`,
          transition: 'none',
        };
      }
      
      if (index === 1) {
        const progress = Math.min(Math.abs(dragDistance.value) / 150, 1);
        const scale = 0.96 + progress * 0.04;
        const rotation = baseRotation * (1 - progress);
        return {
          transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        };
      }
      
      if (index === 2) {
        return {
          transform: `translate(-50%, -50%) scale(0.92) rotate(${baseRotation}deg)`,
        };
      }
      
      return {};
    };

    const goToCalculating = () => {
      // Store liked artists in the store
      store.setLikedArtists(likedArtists.value);
      // Navigate to calculating page
      router.push({ name: PageName.CALCULATING });
    };

    const removeCard = (direction: 'left' | 'right') => {
      if (artists.value.length === 0) return;
      
      const artist = artists.value[0];
      console.log(`Swiped ${direction}:`, artist.name);
      
      // Track liked artists
      if (direction === 'right') {
        likedArtists.value.push(artist.id);
      }
      
      artists.value.shift();
      currentIndex.value++;

      // Check if game is complete
      if (artists.value.length === 0) {
        // Small delay before showing calculating screen
        setTimeout(() => {
          goToCalculating();
        }, 500);
      }
    };

    const swipeLeft = () => {
      removeCard('left');
    };

    const swipeRight = () => {
      removeCard('right');
    };

    // Touch handlers
    const onTouchStart = (e: TouchEvent) => {
      startX.value = e.touches[0].clientX;
      startY.value = e.touches[0].clientY;
      currentX.value = startX.value;
      isDragging.value = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.value) return;
      e.preventDefault(); // Prevent iOS Safari rubber band scrolling
      currentX.value = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      if (!isDragging.value) return;
      
      const threshold = 100;
      if (dragDistance.value > threshold) {
        swipeRight();
      } else if (dragDistance.value < -threshold) {
        swipeLeft();
      }
      
      isDragging.value = false;
      currentX.value = startX.value;
    };

    // Mouse handlers (for desktop testing)
    const onMouseDown = (e: MouseEvent) => {
      startX.value = e.clientX;
      currentX.value = startX.value;
      isDragging.value = true;

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.value) return;
        currentX.value = e.clientX;
      };

      const onMouseUp = () => {
        if (!isDragging.value) return;
        
        const threshold = 100;
        if (dragDistance.value > threshold) {
          swipeRight();
        } else if (dragDistance.value < -threshold) {
          swipeLeft();
        }
        
        isDragging.value = false;
        currentX.value = startX.value;
        
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    return {
      artists,
      visibleCards,
      currentIndex,
      totalCards,
      likeOpacity,
      nopeOpacity,
      getImageUrl,
      getCardStyle,
      swipeLeft,
      swipeRight,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      showIntro,
      dismissIntro,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/config/fonts';

.swipe-game {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  touch-action: pan-x;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: auto;
}

.card-container {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  min-height: 0;
}

.card-stack {
  position: relative;
  width: 100%;
  max-width: 600px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 32px);
  height: calc(100% - 8px);
  max-height: 900px;
  cursor: grab;
  user-select: none;
  transition: transform 0.3s ease;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }

  &--active {
    z-index: 3;
    transform: translate(-50%, -50%);
  }

  &--second {
    z-index: 2;
    transform: translate(-50%, -50%) scale(0.96) rotate(4deg);
  }

  &--third {
    z-index: 1;
    transform: translate(-50%, -50%) scale(0.92) rotate(-3deg);
  }
}

.card__image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center top;
  position: relative;
  border-radius: 45px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.card__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.card__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 40px 36px 40px;
  color: #fff;
}

.card__name {
  font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.card__genres {
  font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #45ff78;
  margin: 4px 0 0 0;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.card__description {
  font-family: 'Mulish', sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  margin: 10px 0 0 0;
  line-height: 1.5;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.action-btn {
  position: absolute;
  top: 50%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 10;

  &:hover {
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &--nope {
    left: -30px;
    transform: translateY(-50%);
    background: #654EAC;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);

    .action-btn__icon {
      color: #fff;
      font-size: 44px;
      font-weight: bold;
    }
  }

  &--like {
    right: -30px;
    transform: translateY(-50%);
    background: #654EAC;
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);

    .action-btn__icon {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
  }
}

.progress {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, calc(-50% + 480px));
  text-align: center;
  z-index: 10;
  width: 100%;
  max-width: 600px;
  padding-top: 50px;

  &__text {
    font-family: 'Mulish', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
  }
}

// Intro Overlay Styles
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: auto;

  &__bg {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.70);
  }
}

.intro-instruction {
  position: absolute;
  z-index: 101;
  
  p {
    font-family: 'Mulish', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: white;
    line-height: 1.1;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  &--top {
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: 90%;
    max-width: 600px;
    
    p {
      font-size: 34px;
      font-weight: 700;
    }
  }

  &--left {
    left: 50px;
    top: 58%;
    text-align: left;
    max-width: 300px;
  }

  &--right {
    right: 100px;
    top: 64%;
    text-align: right;
    max-width: 400px;
  }
}

.intro-instruction--right .intro-arrow--down-right {
  margin-top: -30px;
}

.intro-arrow {
  display: block;
  width: 120px;
  height: auto;
  margin-top: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  
  &--down-left {
    margin-top: 0px;
    transform: rotate(30deg) translateX(10px);
  }
  
  &--down-right {
    margin-left: 150px;
    margin-top: 50px;
    transform: rotate(10deg) scaleX(-1);
  }
}

.intro-start-btn {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: #6D28D9;
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 700;
  padding: 16px 80px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  z-index: 101;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  pointer-events: auto;

  &:hover {
    transform: translateX(-50%) scale(1.05);
    box-shadow: 0 6px 30px rgba(109, 40, 217, 0.4);
  }

  &:active {
    transform: translateX(-50%) scale(0.98);
  }
}
</style>
