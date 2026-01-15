<template>
  <div class="swipe-game">
    <!-- Now Playing indicator -->
    <div v-if="currentSongTitle && !showIntro" class="now-playing">
      <span class="now-playing__label">NOW PLAYING:</span>
      <span class="now-playing__title">{{ currentSongTitle }}</span>
    </div>

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
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
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

// Import all music files
const musicModules = import.meta.glob('@/assets/music/*.mp3', { eager: true, as: 'url' });

// Map artist IDs to their music files and start times (in seconds)
const artistMusicMap: Record<string, { file: string; startTime: number }> = {
  'sabrina': { file: 'sabrinacarpenter-espresso.mp3', startTime: 45 },
  'travisscott': { file: 'travisscott-goosebumps.mp3', startTime: 55 },
  'dualipa': { file: 'dualipa-dontsstartnow.mp3', startTime: 40 },
  'sza': { file: 'sza-killbill.mp3', startTime: 35 },
  'lanadelrey': { file: 'lanadelrey-summertimesadness.mp3', startTime: 60 },
  'charli': { file: 'charlixcx-brat.mp3', startTime: 30 },
  'rosalia': { file: 'rosalia-despecha.mp3', startTime: 45 },
  'laufey': { file: 'laufey-fromthestart.mp3', startTime: 50 },
  'phoebe': { file: 'phoebebridgers-motionsickness.mp3', startTime: 55 },
  'aurora': { file: 'aurora-runaway.mp3', startTime: 60 },
  'troyesivan': { file: 'troyesivan-rush.mp3', startTime: 45 },
  'ashnikko': { file: 'ashnikko-daisy.mp3', startTime: 40 },
  'denzelcurry': { file: 'denzelcurry-walkin.mp3', startTime: 50 },
  'burnaboy': { file: 'burnaboy-lastlast.mp3', startTime: 55 },
  'jbalvin': { file: 'jbalvin-migente.mp3', startTime: 45 },
  'martingarrix': { file: 'martingarrix-animals.mp3', startTime: 60 },
  'diplo': { file: 'diplo-whereareunow.mp3', startTime: 50 },
  'avicii': { file: 'avicii-wakemeup.mp3', startTime: 55 },
  'hanszimmer': { file: 'hanszimmer-cornfieldchase.mp3', startTime: 90 },
  'maxrichter': { file: 'maxrichter-spring1.mp3', startTime: 60 },
  'norahjones': { file: 'norahjones-dontknowwhy.mp3', startTime: 45 },
  'lukecombs': { file: 'lukecombs-whenitrainsitpours.mp3', startTime: 55 },
  'maneskin': { file: 'maneskin-zitteebuoni.mp3', startTime: 50 },
  'foofighters': { file: 'foofighters-everlong.mp3', startTime: 85 },
  'bmth': { file: 'bringmethehorizon-canyoufeelmyheart.mp3', startTime: 55 },
  'system': { file: 'systemofadown-chopsuey!.mp3', startTime: 35 },
  'arcticmonkeys': { file: 'artcticmonkeys-doiwannaknow.mp3', startTime: 65 },
  'beatles': { file: 'beatles-letitbe.mp3', startTime: 50 },
  'bensonboone': { file: 'bensonboone-beautifulthings.mp3', startTime: 55 },
  'coldplay': { file: 'coldplay-yellow.mp3', startTime: 55 },
  'drake': { file: 'drake-onedance.mp3', startTime: 40 },
  'edsheeran': { file: 'edsheeran-perfect.mp3', startTime: 65 },
  'gorillaz': { file: 'gorillaz-feelgoodinc.mp3', startTime: 45 },
  'greenday': { file: 'greenday-boulevardofbrokendreams.mp3', startTime: 50 },
  'grimes': { file: 'grimes-oblivion.mp3', startTime: 70 },
  'kehlani': { file: 'kehlani-folded.mp3', startTime: 45 },
  'kendricklamar': { file: 'kendricklamar-humble.mp3', startTime: 55 },
  'linkinpark': { file: 'linkinpark-intheend.mp3', startTime: 55 },
  'oliviadean': { file: 'oliviadean-manineed.mp3', startTime: 50 },
  'roxydekker': { file: 'roxydekker-sugardaddy.mp3', startTime: 40 },
  'slipknot': { file: 'slipknot-duality.mp3', startTime: 45 },
  'suzanfreek': { file: 'suzanfreek-alshetavondis.mp3', startTime: 55 },
  'tameimpala': { file: 'tameimpala-thelessiknow.mp3', startTime: 75 },
  'tatemcrae': { file: 'tatemcrae-greedy.mp3', startTime: 35 },
  'taylorswift': { file: 'taylorswift-cruelsummer.mp3', startTime: 55 },
  'the1975': { file: 'the1975-somebodyelse.mp3', startTime: 70 },
  'theweeknd': { file: 'theweekend-blindinglights.mp3', startTime: 50 },
  'tiesto': { file: 'tiesto-thebusiness.mp3', startTime: 45 },
};

// Map artist IDs to song titles for "Now Playing" display
const artistSongTitles: Record<string, string> = {
  'sabrina': 'Espresso - Sabrina Carpenter',
  'travisscott': 'Goosebumps - Travis Scott',
  'dualipa': "Don't Start Now - Dua Lipa",
  'sza': 'Kill Bill - SZA',
  'lanadelrey': 'Summertime Sadness - Lana Del Rey',
  'charli': 'Brat - Charli XCX',
  'rosalia': 'Despechá - Rosalía',
  'laufey': 'From The Start - Laufey',
  'phoebe': 'Motion Sickness - Phoebe Bridgers',
  'aurora': 'Runaway - AURORA',
  'troyesivan': 'Rush - Troye Sivan',
  'ashnikko': 'Daisy - Ashnikko',
  'denzelcurry': 'Walkin - Denzel Curry',
  'burnaboy': 'Last Last - Burna Boy',
  'jbalvin': 'Mi Gente - J Balvin',
  'martingarrix': 'Animals - Martin Garrix',
  'diplo': 'Where Are Ü Now - Diplo',
  'avicii': 'Wake Me Up - Avicii',
  'hanszimmer': 'Cornfield Chase - Hans Zimmer',
  'maxrichter': 'Spring 1 - Max Richter',
  'norahjones': "Don't Know Why - Norah Jones",
  'lukecombs': 'When It Rains It Pours - Luke Combs',
  'maneskin': 'Zitti E Buoni - Måneskin',
  'foofighters': 'Everlong - Foo Fighters',
  'bmth': 'Can You Feel My Heart - BMTH',
  'system': 'Chop Suey! - System of a Down',
  'arcticmonkeys': 'Do I Wanna Know? - Arctic Monkeys',
  'beatles': 'Let It Be - The Beatles',
  'bensonboone': 'Beautiful Things - Benson Boone',
  'coldplay': 'Yellow - Coldplay',
  'drake': 'One Dance - Drake',
  'edsheeran': 'Perfect - Ed Sheeran',
  'gorillaz': 'Feel Good Inc. - Gorillaz',
  'greenday': 'Boulevard of Broken Dreams - Green Day',
  'grimes': 'Oblivion - Grimes',
  'kehlani': 'Folded - Kehlani',
  'kendricklamar': 'HUMBLE. - Kendrick Lamar',
  'linkinpark': 'In The End - Linkin Park',
  'oliviadean': 'The Man I Need - Olivia Dean',
  'roxydekker': 'Sugar Daddy - Roxy Dekker',
  'slipknot': 'Duality - Slipknot',
  'suzanfreek': 'Als Het Avond Is - Suzan & Freek',
  'tameimpala': 'The Less I Know The Better - Tame Impala',
  'tatemcrae': 'Greedy - Tate McRae',
  'taylorswift': 'Cruel Summer - Taylor Swift',
  'the1975': 'Somebody Else - The 1975',
  'theweeknd': 'Blinding Lights - The Weeknd',
  'tiesto': 'The Business - Tiësto',
};

// Get music URL and start time for an artist
function getMusicInfo(artistId: string): { url: string; startTime: number } | null {
  const musicData = artistMusicMap[artistId];
  if (!musicData) return null;
  
  for (const [key, url] of Object.entries(musicModules)) {
    if (key.includes(musicData.file)) {
      return { url, startTime: musicData.startTime };
    }
  }
  return null;
}

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
      // Start playing music when intro is dismissed
      playCurrentArtistMusic();
    };
    
    // Audio player for background music
    const audioPlayer = ref<HTMLAudioElement | null>(null);
    
    const playCurrentArtistMusic = () => {
      if (artists.value.length === 0) return;
      
      const currentArtist = artists.value[0];
      const musicInfo = getMusicInfo(currentArtist.id);
      
      if (musicInfo) {
        if (audioPlayer.value) {
          audioPlayer.value.pause();
        }
        audioPlayer.value = new Audio(musicInfo.url);
        audioPlayer.value.volume = 0.05; // Very quiet background music
        audioPlayer.value.loop = true;
        audioPlayer.value.currentTime = musicInfo.startTime; // Start at chorus
        audioPlayer.value.play().catch(err => {
          console.log('Audio autoplay blocked:', err);
        });
      }
    };
    
    const stopMusic = () => {
      if (audioPlayer.value) {
        audioPlayer.value.pause();
        audioPlayer.value = null;
      }
    };
    
    // Clean up audio on unmount
    onUnmounted(() => {
      stopMusic();
    });
    
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

    // Current song title for "Now Playing" display
    const currentSongTitle = computed(() => {
      if (artists.value.length === 0) return '';
      const currentArtist = artists.value[0];
      return artistSongTitles[currentArtist.id] || '';
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
        // Stop music and go to calculating screen
        stopMusic();
        setTimeout(() => {
          goToCalculating();
        }, 500);
      } else {
        // Play music for the next artist
        if (!showIntro.value) {
          playCurrentArtistMusic();
        }
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
      currentSongTitle,
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

.now-playing {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  backdrop-filter: blur(10px);

  &__label {
    font-family: 'Mulish', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  &__title {
    font-family: 'Mulish', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-align: center;
  }
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
    top: 67%;
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
    margin-left: 90px;
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
