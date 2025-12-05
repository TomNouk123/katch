<template>
  <div class="swipe-game">
    <!-- Logo -->
    <header class="header">
      <img 
        src="@/assets/images/logos/katch-logo-purple.png" 
        alt="KATCH" 
        class="logo"
      />
    </header>

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
          @touchstart="index === 0 ? onTouchStart($event) : null"
          @touchmove="index === 0 ? onTouchMove($event) : null"
          @touchend="index === 0 ? onTouchEnd() : null"
          @mousedown="index === 0 ? onMouseDown($event) : null"
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
        <button class="action-btn action-btn--nope" @click="swipeLeft">
          <span class="action-btn__icon">✕</span>
        </button>
        <button class="action-btn action-btn--like" @click="swipeRight">
          <span class="action-btn__icon">♥</span>
        </button>
      </div>
    </div>

    <!-- Progress -->
    <div class="progress">
      <span class="progress__text">{{ currentIndex }}/{{ totalCards }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import artistData from '@/assets/data/western-artists.json';
import { getTopMatch } from '@/utils/_MatchingAlgorithm';
import { PageName } from '@/utils/_Constants';

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
const ARTISTS_PER_GAME = 20;

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

    const goToResults = () => {
      const topMatch = getTopMatch(likedArtists.value);
      // Default to 'twice' if no likes or no match found
      const matchedGroup = topMatch || 'twice';
      router.push({ name: PageName.RESULTS, params: { groupId: matchedGroup } });
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
        // Small delay before showing results
        setTimeout(() => {
          goToResults();
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
    };
  },
});
</script>

<style lang="scss" scoped>
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

.header {
  padding: 16px 24px 12px;
  text-align: center;
  z-index: 10;

  .logo {
    height: 160px;
    width: auto;
    margin-bottom: -200px;
  }
}

.card-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  min-height: 0;
}

.card-stack {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 100%;
}

.card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 48px);
  height: calc(100% - 16px);
  max-height: 820px;
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
  border-radius: 20px;
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
  padding: 24px;
  color: #fff;
}

.card__name {
  font-family: 'Outfit', sans-serif;
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.card__genres {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #fbbf24;
  margin: 10px 0 0 0;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.card__description {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
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
    left: -50px;
    transform: translateY(-50%);
    background: #6366f1;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);

    .action-btn__icon {
      color: #fff;
      font-size: 44px;
      font-weight: bold;
    }
  }

  &--like {
    right: -50px;
    transform: translateY(-50%);
    background: #8b5cf6;
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);

    .action-btn__icon {
      color: #fff;
      font-size: 44px;
    }
  }
}

.progress {
  text-align: center;
  padding: 12px 0 24px;
  z-index: 10;

  &__text {
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #1a1a2e;
  }
}
</style>
