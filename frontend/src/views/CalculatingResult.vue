<template>
  <div class="calculating-result">
    <!-- Animated Hearts Background -->
    <div class="background-hearts">
      <div class="hearts-container">
        <svg 
          v-for="heart in hearts" 
          :key="heart.id" 
          class="floating-heart"
          :class="`heart-${heart.id % 4}`"
          :style="{
            left: heart.x + '%',
            animationDelay: heart.delay + 's',
            animationDuration: heart.duration + 's',
          }"
          viewBox="0 0 24 24"
          :width="heart.size"
          :height="heart.size"
        >
          <path 
            :fill="heart.color" 
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </div>
      <div class="overlay"></div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Phase 1 & 2: Analyseren heading -->
      <h1 class="heading" v-if="!showRanking">Analyseren....</h1>
      
      <!-- Phase 3: Results heading -->
      <h1 class="heading ranking-heading" v-if="showRanking">Jouw K-pop matches!</h1>
      
      <!-- Main content area -->
      <div class="main-area">
        <!-- Typewriter text - stays visible during game phase -->
        <div class="text-container" v-if="!showRanking">
          <p class="thinking-text"><span v-html="displayedText"></span><span class="cursor" v-if="isTyping">|</span></p>
        </div>

        <!-- K-pop Guessing Game - appears below text -->
        <div class="game-container" v-if="showGame && !showRanking">
          <h2 class="game-title">Ben je samen met een K-pop fan?</h2>
          <p class="game-subtitle">Vraag hen welke 3 groepen zij denken dat jouw perfecte match is!</p>
          <p class="game-hint">Selecteer 3 of skip</p>

          <!-- Group Grid - Row 1 -->
          <div class="groups-row">
            <div 
              v-for="group in displayedGroups.slice(0, 4)" 
              :key="group.id"
              class="group-card"
              :class="{ 'selected': selectedGroups.includes(group.id) }"
              @click="toggleGroupSelection(group.id)"
            >
              <div class="group-image-wrapper">
                <img :src="getGroupImage(group.image)" :alt="group.name" class="group-image" />
                <div class="selection-indicator" v-if="selectedGroups.includes(group.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <p class="group-name">{{ group.name }}</p>
            </div>
          </div>

          <!-- Group Grid - Row 2 -->
          <div class="groups-row">
            <div 
              v-for="group in displayedGroups.slice(4, 8)" 
              :key="group.id"
              class="group-card"
              :class="{ 'selected': selectedGroups.includes(group.id) }"
              @click="toggleGroupSelection(group.id)"
            >
              <div class="group-image-wrapper">
                <img :src="getGroupImage(group.image)" :alt="group.name" class="group-image" />
                <div class="selection-indicator" v-if="selectedGroups.includes(group.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <p class="group-name">{{ group.name }}</p>
            </div>
          </div>

          <!-- Skip link -->
          <button class="skip-btn" @click="skipGame">Skip</button>

          <!-- Resultaat Button -->
          <button 
            class="result-btn"
            :class="{ 'disabled': selectedGroups.length === 0 }"
            @click="showResults"
          >
            Resultaat
          </button>
        </div>

        <!-- Phase 3: Results with percentages -->
        <div class="ranking-container" v-if="showRanking">
          <!-- Correct guesses message (only if played the game) -->
          <div class="guess-result" v-if="playedGame">
            <p class="guess-text" v-if="correctGuesses === 3">Wauw! Je raadde alle 3 goed!</p>
            <p class="guess-text" v-else-if="correctGuesses === 2">Goed gedaan! Je raadde er 2 van de 3 goed!</p>
            <p class="guess-text" v-else-if="correctGuesses === 1">Je raadde er 1 van de 3 goed!</p>
            <p class="guess-text" v-else>Helaas, geen goede gok dit keer!</p>
          </div>

          <!-- Matches list -->
          <div class="matches-list">
            <!-- Match 1 (Top match) -->
            <transition name="slide-in-1">
              <div v-if="showMatch1" class="match-card match-1" @click="goToGroup(0)">
                <div class="match-image">
                  <img :src="getGroupImage(topMatches[0]?.image)" :alt="topMatches[0]?.name" />
                </div>
                <div class="match-info">
                  <span class="match-percentage">{{ matchPercentages[0] }}%</span>
                  <h2 class="match-name">{{ topMatches[0]?.name }}</h2>
                  <p class="match-genres">{{ getTopGenres(topMatches[0]?.tags) }}</p>
                </div>
                <div class="match-bar">
                  <div class="match-bar-fill" :style="{ width: matchPercentages[0] + '%' }"></div>
                </div>
              </div>
            </transition>

            <!-- Match 2 -->
            <transition name="slide-in-2">
              <div v-if="showMatch2" class="match-card match-2" @click="goToGroup(1)">
                <div class="match-image">
                  <img :src="getGroupImage(topMatches[1]?.image)" :alt="topMatches[1]?.name" />
                </div>
                <div class="match-info">
                  <span class="match-percentage">{{ matchPercentages[1] }}%</span>
                  <h2 class="match-name">{{ topMatches[1]?.name }}</h2>
                  <p class="match-genres">{{ getTopGenres(topMatches[1]?.tags) }}</p>
                </div>
                <div class="match-bar">
                  <div class="match-bar-fill" :style="{ width: matchPercentages[1] + '%' }"></div>
                </div>
              </div>
            </transition>

            <!-- Match 3 -->
            <transition name="slide-in-3">
              <div v-if="showMatch3" class="match-card match-3" @click="goToGroup(2)">
                <div class="match-image">
                  <img :src="getGroupImage(topMatches[2]?.image)" :alt="topMatches[2]?.name" />
                </div>
                <div class="match-info">
                  <span class="match-percentage">{{ matchPercentages[2] }}%</span>
                  <h2 class="match-name">{{ topMatches[2]?.name }}</h2>
                  <p class="match-genres">{{ getTopGenres(topMatches[2]?.tags) }}</p>
                </div>
                <div class="match-bar">
                  <div class="match-bar-fill" :style="{ width: matchPercentages[2] + '%' }"></div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Continue button -->
          <transition name="fade">
            <button 
              v-if="showButton" 
              class="continue-btn"
              @click="goToResults"
            >
              Bekijk resultaat
            </button>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDataStore } from '@/store/_DataStore';
import { PageName } from '@/utils/_Constants';
import { artistTagMapping, getTopMatches as getTopMatchResults } from '@/utils/_MatchingAlgorithm';
import kpopGroupsData from '@/assets/data/kpop-groups.json';

interface KpopGroup {
  id: string;
  name: string;
  image: string;
  tags: string[];
  fandomName?: string;
}

interface FloatingHeart {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const generateHearts = (): FloatingHeart[] => {
  const colors = ['#8B5CF6', '#A78BFA', '#7C3AED', '#6D28D9', '#C4B5FD', '#9333EA'];
  const hearts: FloatingHeart[] = [];
  const totalHearts = 15;
  const baseDuration = 25;
  
  for (let i = 0; i < totalHearts; i++) {
    const baseDelay = (i / totalHearts) * baseDuration;
    const delayOffset = (Math.random() - 0.5) * 3;
    
    hearts.push({
      id: i,
      x: 5 + Math.random() * 85,
      size: 22 + Math.random() * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: baseDelay + delayOffset,
      duration: baseDuration + (Math.random() - 0.5) * 4,
    });
  }
  
  return hearts;
};

const groupImages = import.meta.glob('@/assets/images/kpop-groups/**/*', { eager: true, as: 'url' });

const artistDisplayNames: Record<string, string> = {
  'sabrina': 'Sabrina Carpenter',
  'dualipa': 'Dua Lipa',
  'troyesivan': 'Troye Sivan',
  'taylorswift': 'Taylor Swift',
  'edsheeran': 'Ed Sheeran',
  'bensonboone': 'Benson Boone',
  'tatemcrae': 'Tate McRae',
  'roxydekker': 'Roxy Dekker',
  'sza': 'SZA',
  'norahjones': 'Norah Jones',
  'theweeknd': 'The Weeknd',
  'kehlani': 'Kehlani',
  'oliviadean': 'Olivia Dean',
  'drake': 'Drake',
  'lanadelrey': 'Lana Del Rey',
  'phoebe': 'Phoebe Bridgers',
  'aurora': 'Aurora',
  'laufey': 'Laufey',
  'arcticmonkeys': 'Arctic Monkeys',
  'the1975': 'The 1975',
  'tameimpala': 'Tame Impala',
  'charli': 'Charli XCX',
  'ashnikko': 'Ashnikko',
  'grimes': 'Grimes',
  'travisscott': 'Travis Scott',
  'denzelcurry': 'Denzel Curry',
  'kendricklamar': 'Kendrick Lamar',
  'rosalia': 'Rosalía',
  'jbalvin': 'J Balvin',
  'burnaboy': 'Burna Boy',
  'martingarrix': 'Martin Garrix',
  'diplo': 'Diplo',
  'avicii': 'Avicii',
  'lukecombs': 'Luke Combs',
  'suzanfreek': 'Suzan & Freek',
  'maneskin': 'Måneskin',
  'foofighters': 'Foo Fighters',
  'bmth': 'Bring Me The Horizon',
  'system': 'System of a Down',
  'linkinpark': 'Linkin Park',
  'greenday': 'Green Day',
  'slipknot': 'Slipknot',
  'coldplay': 'Coldplay',
  'beatles': 'The Beatles',
  'gorillaz': 'Gorillaz',
};

export default defineComponent({
  name: 'CalculatingResult',
  setup() {
    const router = useRouter();
    const hearts = generateHearts();
    const store = useDataStore();
    
    // Phase states
    const displayedText = ref('');
    const isTyping = ref(true);
    const showGame = ref(false);
    const showRanking = ref(false);
    const showMatch1 = ref(false);
    const showMatch2 = ref(false);
    const showMatch3 = ref(false);
    const showButton = ref(false);
    
    // Game states
    const selectedGroups = ref<string[]>([]);
    const playedGame = ref(false);
    const correctGuesses = ref(0);
    
    const likedArtistIds = computed(() => {
      return (store.likedArtists as string[]) || [];
    });

    const matchResults = computed(() => {
      return getTopMatchResults(likedArtistIds.value, 3);
    });
    
    const topMatches = computed(() => {
      return matchResults.value.map(result => {
        return kpopGroupsData.groups.find(g => g.id === result.groupId) as KpopGroup | undefined;
      }).filter(Boolean) as KpopGroup[];
    });

    const matchPercentages = computed(() => {
      if (matchResults.value.length === 0) return [0, 0, 0];
      return matchResults.value.map(r => r.percentage);
    });

    const shuffledGroups = ref<KpopGroup[]>([]);
    
    const initializeDisplayedGroups = () => {
      const resultIds = topMatches.value.map(g => g.id);
      const otherGroups = kpopGroupsData.groups.filter(g => !resultIds.includes(g.id)) as KpopGroup[];
      
      const shuffled = [...otherGroups].sort(() => Math.random() - 0.5);
      const selectedOthers = shuffled.slice(0, 5);
      
      const allGroups = [...topMatches.value, ...selectedOthers];
      shuffledGroups.value = allGroups.sort(() => Math.random() - 0.5);
    };
    
    const displayedGroups = computed(() => shuffledGroups.value);

    const getGroupImage = (imagePath: string | undefined) => {
      if (!imagePath) return '';
      for (const [key, url] of Object.entries(groupImages)) {
        if (key.includes(imagePath)) {
          return url;
        }
      }
      return '';
    };

    const getTopGenres = (tags: string[] | undefined) => {
      if (!tags) return '';
      return tags.slice(0, 3).map(tag => tag.toUpperCase()).join(', ');
    };

    const toggleGroupSelection = (groupId: string) => {
      const index = selectedGroups.value.indexOf(groupId);
      if (index > -1) {
        selectedGroups.value.splice(index, 1);
      } else if (selectedGroups.value.length < 3) {
        selectedGroups.value.push(groupId);
      }
    };

    const generateThinkingText = (): string => {
      if (likedArtistIds.value.length === 0) {
        return 'Hmm, geen swipes gevonden...<br>Laten we toch kijken wat we kunnen vinden!';
      }

      // Get up to 3 artist names with bold tags
      const artistNames = likedArtistIds.value
        .slice(0, 3)
        .map(id => `<b>${artistDisplayNames[id] || id}</b>`);
      
      // Format artist names: "Artist1, Artist2 en Artist3"
      let artistText = '';
      if (artistNames.length === 1) {
        artistText = artistNames[0];
      } else if (artistNames.length === 2) {
        artistText = `${artistNames[0]} en ${artistNames[1]}`;
      } else {
        artistText = `${artistNames[0]}, ${artistNames[1]} en ${artistNames[2]}`;
      }

      const allTags: string[] = [];
      likedArtistIds.value.forEach(artistId => {
        const tags = artistTagMapping[artistId];
        if (tags) {
          allTags.push(...tags);
        }
      });

      const tagCounts: Record<string, number> = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);

      const genreMap: Record<string, string> = {
        'pop': 'pop',
        'dance': 'dance',
        'edm': 'EDM',
        'r&b': 'R&B',
        'rock': 'rock',
        'hip-hop': 'hip-hop',
        'trap': 'trap',
        'indie': 'indie',
        'folk': 'folk',
        'jazz': 'jazz',
        'soul': 'soul',
        'metal': 'metal',
        'hyperpop': 'hyperpop',
        'electropop': 'electropop',
        'synth-pop': 'synth',
        'alt-rock': 'alt-rock',
        'alternative-rock': 'alt-rock',
        'alternative-metal': 'metal',
        'indie-rock': 'indie rock',
        'indie-pop': 'indie pop',
        'folk-pop': 'folk',
        'acoustic': 'acoustic',
        'funk': 'funk',
        'neo-soul': 'neo-soul',
        'electronic': 'electronic',
        'punk-rock': 'punk rock',
        'pop-rock': 'pop rock',
        'soft-rock': 'soft rock',
      };

      // Format genres with bold tags
      const topGenres = sortedTags
        .map(tag => `<b>${genreMap[tag] || tag}</b>`)
        .join(', ');

      return `Mmmmhhh, ${artistText}.... Zo te zien ben je een grote fan van ${topGenres}.... Eens kijken met wie we jou kunnen matchen...`;
    };

    const typeText = (text: string, speed: number = 40) => {
      let charIndex = 0;
      displayedText.value = '';
      
      const type = () => {
        if (charIndex < text.length) {
          // Check if we're at the start of an HTML tag
          if (text[charIndex] === '<') {
            // Find the closing bracket and add the entire tag at once
            const closingIndex = text.indexOf('>', charIndex);
            if (closingIndex !== -1) {
              displayedText.value += text.substring(charIndex, closingIndex + 1);
              charIndex = closingIndex + 1;
              setTimeout(type, 0); // No delay for tags
              return;
            }
          }
          
          displayedText.value += text[charIndex];
          charIndex++;
          setTimeout(type, speed);
        } else {
          isTyping.value = false;
          setTimeout(() => {
            saveResultsToBackend();
            showGame.value = true;
          }, 1500);
        }
      };

      type();
    };

    const saveResultsToBackend = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const matches = topMatches.value.map((group, index) => ({
          id: group.id,
          name: group.name,
          percentage: matchResults.value[index]?.percentage || 0,
          fandomName: group.fandomName || null,
          genres: group.tags?.slice(0, 3) || [],
        }));
        
        await fetch(`${apiUrl}/api/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matches, timestamp: new Date().toISOString() }),
        });
        
        console.log('Results saved to backend for NFC receipt');
      } catch (error) {
        console.error('Failed to save results to backend:', error);
      }
    };

    const calculateCorrectGuesses = () => {
      const topMatchIds = topMatches.value.map(g => g.id);
      let correct = 0;
      for (const selectedId of selectedGroups.value) {
        if (topMatchIds.includes(selectedId)) {
          correct++;
        }
      }
      correctGuesses.value = correct;
    };

    const showResultsWithAnimation = () => {
      showRanking.value = true;
      
      setTimeout(() => {
        showMatch1.value = true;
      }, 300);
      setTimeout(() => {
        showMatch2.value = true;
      }, 900);
      setTimeout(() => {
        showMatch3.value = true;
      }, 1500);
      setTimeout(() => {
        showButton.value = true;
      }, 2200);
    };

    const skipGame = () => {
      playedGame.value = false;
      showResultsWithAnimation();
    };

    const showResults = () => {
      if (selectedGroups.value.length > 0) {
        playedGame.value = true;
        calculateCorrectGuesses();
      } else {
        playedGame.value = false;
      }
      showResultsWithAnimation();
    };

    const goToResults = () => {
      const topGroupIds = topMatches.value.map(g => g.id);
      store.setTopMatchIds(topGroupIds);
      router.push({ name: PageName.RESULTS, params: { groupId: topGroupIds[0] } });
    };

    const goToGroup = (index: number) => {
      const topGroupIds = topMatches.value.map(g => g.id);
      store.setTopMatchIds(topGroupIds);
      router.push({ name: PageName.RESULTS, params: { groupId: topGroupIds[index] } });
    };

    onMounted(() => {
      initializeDisplayedGroups();
      const thinkingText = generateThinkingText();
      setTimeout(() => {
        typeText(thinkingText, 35);
      }, 300);
    });

    return {
      displayedText,
      isTyping,
      showGame,
      showRanking,
      showMatch1,
      showMatch2,
      showMatch3,
      showButton,
      selectedGroups,
      playedGame,
      correctGuesses,
      displayedGroups,
      hearts,
      topMatches,
      matchPercentages,
      getGroupImage,
      getTopGenres,
      toggleGroupSelection,
      skipGame,
      showResults,
      goToResults,
      goToGroup,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/config/fonts';

.calculating-result {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  -webkit-overflow-scrolling: touch;
}

.background-hearts {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #9F7AEA 0%, #B794F4 50%, #9F7AEA 100%);
}

.hearts-container {
  position: absolute;
  inset: 0;
}

.floating-heart {
  position: absolute;
  bottom: -50px;
  animation-name: floatUp;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  opacity: 0.3;
  
  path {
    animation: pulsate 2s ease-in-out infinite;
    transform-origin: center;
    transform-box: fill-box;
  }
}

.heart-0 path { animation: pulsate 2.2s ease-in-out infinite; }
.heart-1 path { animation: pulsate 2.8s ease-in-out infinite; animation-delay: 0.5s; }
.heart-2 path { animation: pulsate 2.5s ease-in-out infinite; animation-delay: 0.8s; }
.heart-3 path { animation: pulsate 3s ease-in-out infinite; animation-delay: 0.2s; }

@keyframes floatUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-120vh); }
}

@keyframes pulsate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.overlay {
  position: absolute;
  inset: 0;
  background: transparent;
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px 28px 80px;
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.heading {
  font-family: 'Outfit', sans-serif;
  font-size: 56px;
  font-weight: 700;
  color: #fff;
  margin: 40px 0 20px 0;
  letter-spacing: 1px;
  
  &.ranking-heading {
    font-size: 48px;
    font-style: normal;
  }
}

.main-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.text-container {
  width: 90%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.thinking-text {
  font-family: 'Mulish', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #fff;
  line-height: 1.4;
  text-align: center;
  white-space: pre-line;
  margin: 0;
}

.cursor {
  display: inline;
  margin-left: 2px;
  color: #fff;
  font-weight: 300;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 30px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.game-title {
  font-family: 'Outfit', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color:rgb(255, 255, 255);
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.game-subtitle {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color:rgb(255, 255, 255);
  margin: 0 0 8px 0;
  opacity: 0.9;
}

.game-hint {
  font-family: 'Mulish', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color:rgb(255, 255, 255);
  margin: 0 0 24px 0;
  opacity: 0.7;
}

.groups-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 16px;
  padding: 0 10px;
  box-sizing: border-box;
}

.group-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  width: 22%;
  max-width: 130px;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &.selected {
    .group-image-wrapper {
      box-shadow: 0 0 0 4px #fff, 0 0 0 6px #654EAC;
    }
    
    .group-name {
      color: #fff;
      font-weight: 800;
    }
  }
}

.group-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease;
}

.group-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selection-indicator {
  position: absolute;
  inset: 0;
  background: rgba(101, 78, 172, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 40px;
    height: 40px;
    color: #fff;
  }
}

.group-name {
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color:rgb(255, 255, 255);
  margin: 8px 0 0 0;
  text-align: center;
}

.skip-btn {
  font-family: 'Mulish', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color:rgb(255, 255, 255);
  background: transparent;
  border: none;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 16px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
}

.result-btn {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #654EAC;
  background: #fff;
  border-radius: 30px;
  padding: 14px 60px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  
  &:hover:not(.disabled) {
    background: #654EAC;
    color: #fff;
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: default;
  }
}

// Ranking / Results styles
.ranking-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-top: 60px;
  animation: fadeIn 0.5s ease-out;
}

.guess-result {
  margin-bottom: 24px;
  animation: fadeIn 0.5s ease-out;
}

.guess-text {
  font-family: 'Mulish', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 700px;
  min-height: 456px;
}

.match-card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #fff;
  border-radius: 30px;
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
}

.match-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 14px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.match-info {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.match-percentage {
  font-family: 'Mulish', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.match-name {
  font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: #333;
  margin: 0;
  text-transform: uppercase;
  line-height: 1;
}

.match-genres {
  font-family: 'Mulish', sans-serif;
  font-size: 20px;
  font-weight: 900;
  color: #654EAC;
  margin: -2px 0 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.match-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(139, 92, 246, 0.2);
}

.match-bar-fill {
  height: 100%;
  background: #654EAC;
  border-radius: 0 3px 3px 0;
  transition: width 0.8s ease-out;
}

.continue-btn {
  margin-top: 30px;
  background: rgba(255, 255, 255);
  border: 2px solid rgba(255, 255, 255, 1);
  color: #654EAC;
  font-family: 'Mulish', sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 16px 48px;
  border-radius: 30px;
  cursor: pointer;
  transition: opacity 0.3s ease, box-shadow 0.3s ease;
  text-shadow: none;

  &:hover {
    background: #fff;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
  }
}

// Slide-in animations for each match
.slide-in-1-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-in-1-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-in-2-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-in-2-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-in-3-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-in-3-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

// Fade transition for button
.fade-enter-active {
  transition: opacity 0.5s ease-out;
}

.fade-enter-from {
  opacity: 0;
}
</style>
