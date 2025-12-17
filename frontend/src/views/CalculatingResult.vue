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
      <!-- Fixed heading at top -->
      <h1 class="heading" :class="{ 'ranking-mode': showRanking }">
        {{ showRanking ? 'Jouw K-pop matches!' : 'Analyseren...' }}
      </h1>
      
      <!-- Main content area -->
      <div class="main-area">
        <!-- Text container - hidden when ranking shows -->
        <div class="text-container" v-if="!showRanking">
          <p class="thinking-text">{{ displayedText }}<span class="cursor" :class="{ 'blink': isTyping }">|</span></p>
        </div>

        <!-- Ranking appears after text completes -->
        <div class="matches-list" v-if="showRanking">
        <!-- Match 1 (Top match) -->
        <transition name="slide-in-1">
          <div v-if="showMatch1" class="match-card match-1">
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
          <div v-if="showMatch2" class="match-card match-2">
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
          <div v-if="showMatch3" class="match-card match-3">
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
      </div>

      <!-- Button appears after ranking is shown -->
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
}

interface FloatingHeart {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

// Generate scattered hearts with evenly distributed timing
const generateHearts = (): FloatingHeart[] => {
  const colors = ['#8B5CF6', '#A78BFA', '#7C3AED', '#6D28D9', '#C4B5FD', '#9333EA'];
  const hearts: FloatingHeart[] = [];
  const totalHearts = 15;
  const baseDuration = 25;
  
  for (let i = 0; i < totalHearts; i++) {
    // Evenly space the delays across the animation cycle
    const baseDelay = (i / totalHearts) * baseDuration;
    // Add small random offset to avoid perfect grid
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

// Import all kpop group images
const groupImages = import.meta.glob('@/assets/images/kpop-groups/**/*', { eager: true, as: 'url' });

export default defineComponent({
  name: 'CalculatingResult',
  setup() {
    const router = useRouter();
    const hearts = generateHearts();
    const store = useDataStore();
    
    const displayedText = ref('');
    const isTyping = ref(true);
    const showRanking = ref(false);
    const showMatch1 = ref(false);
    const showMatch2 = ref(false);
    const showMatch3 = ref(false);
    const showButton = ref(false);
    
    // Get liked artists from store
    const likedArtistIds = computed(() => {
      return (store.likedArtists as string[]) || [];
    });

    // Get top 3 matches
    const matchResults = computed(() => {
      return getTopMatchResults(likedArtistIds.value, 3);
    });
    
    // Get actual group data for top matches
    const topMatches = computed(() => {
      return matchResults.value.map(result => {
        return kpopGroupsData.groups.find(g => g.id === result.groupId) as KpopGroup | undefined;
      }).filter(Boolean) as KpopGroup[];
    });
    
    // Calculate percentages relative to top match
    const matchPercentages = computed(() => {
      if (matchResults.value.length === 0) return [0, 0, 0];
      return matchResults.value.map(r => r.percentage);
    });

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

    // Generate personalized thinking text based on liked artists
    const generateThinkingText = (): string => {
      if (likedArtistIds.value.length === 0) {
        return 'Hmm, laat me even nadenken...\nIk weet precies wat jouw resultaat moet zijn!';
      }

      // Collect all tags from liked artists
      const allTags: string[] = [];
      likedArtistIds.value.forEach(artistId => {
        const tags = artistTagMapping[artistId];
        if (tags) {
          allTags.push(...tags);
        }
      });

      // Count tag frequencies
      const tagCounts: Record<string, number> = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Get most common tags
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);

      // Map tags to readable English genre names
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
        'reggaeton': 'reggaeton',
        'dancehall': 'dancehall',
        'orchestral': 'orchestral',
        'ambient': 'ambient',
        'acoustic': 'acoustic',
        'ballad': 'ballad',
        'vocal': 'vocal',
        'experimental': 'experimental',
        'art-pop': 'art-pop',
        'dream-pop': 'dream-pop',
        'synth-pop': 'synth-pop',
        'alt-rock': 'alt-rock',
        'nu-metal': 'nu-metal',
        'metalcore': 'metalcore',
        'progressive': 'progressive',
        'tropical': 'tropical',
        'afrobeats': 'afrobeats',
        'bossa-nova': 'bossa nova',
        'neo-soul': 'neo-soul',
        'emotional': 'emotional',
        'catchy': 'catchy',
        'upbeat': 'upbeat',
        'disco': 'disco',
        'retro': 'retro',
        'epic': 'epic',
        'theatrical': 'theatrical',
        'anthemic': 'anthemic',
        'minimalist': 'minimalist',
        'glam': 'glam',
        'dark': 'dark',
        'hardcore': 'hardcore',
        'party': 'party',
      };

      // Get top 2 genres
      const genre1 = sortedTags[0] ? (genreMap[sortedTags[0]] || sortedTags[0]) : 'pop';
      const genre2 = sortedTags[1] ? (genreMap[sortedTags[1]] || sortedTags[1]) : 'dance';

      // Randomized text templates
        const textTemplates = [
          `Je swipes laten een duidelijk patroon zien. ${genre1} komt vaker terug dan toeval zou toestaan.\n${genre2} duikt op als onverwachte wildcard.\nOnze algoritmes doen nu alsof dit heel ingewikkeld is.\nResultaat volgt zo.`,
          `We nemen je keuzes serieus. Misschien iets té serieus.\nTot nu toe zeggen ze dit:\nje voelt je comfortabel bij ${genre1},\nmaar ${genre2} maakt je nieuwsgierig genoeg om te blijven swipen.\nWe zetten alles netjes op een rijtje.`,
          `We zijn diep gedoken in je swipes en kwamen twee dingen tegen die je niet meer kunt ontkennen:\n${genre1} en ${genre2}.\n\nWat dat precies betekent?\nDat gaan we zo voor je onthullen.`,
          `We hebben al je swipes bekeken, herbekeken en misschien één keer te kritisch geanalyseerd.\nWat meteen opvalt: ${genre1} was duidelijk jouw veilige keuze.\nMaar elke keer als ${genre2} voorbij kwam, twijfelde je nét iets langer.\nDat vinden we interessant.\nWe leggen de laatste verbanden nu.`,
        ];

      // Pick a random template
      const randomIndex = Math.floor(Math.random() * textTemplates.length);
      return textTemplates[randomIndex];
    };

    // Typewriter effect
    const typeText = (text: string, speed: number = 50) => {
      const lines = text.split('\n');
      let currentLineIndex = 0;
      let currentCharIndex = 0;
      displayedText.value = '';

      const type = () => {
        if (currentLineIndex < lines.length) {
          const currentLine = lines[currentLineIndex];
          
          if (currentCharIndex < currentLine.length) {
            displayedText.value += currentLine[currentCharIndex];
            currentCharIndex++;
            setTimeout(type, speed);
          } else {
            // Move to next line
            if (currentLineIndex < lines.length - 1) {
              displayedText.value += '\n';
            }
            currentLineIndex++;
            currentCharIndex = 0;
            setTimeout(type, speed);
          }
        } else {
          // Typing complete - wait a few seconds before showing ranking
          isTyping.value = false;
          setTimeout(() => {
            showRanking.value = true;
            // Show matches one by one
            setTimeout(() => {
              showMatch1.value = true;
            }, 300);
            setTimeout(() => {
              showMatch2.value = true;
            }, 900);
            setTimeout(() => {
              showMatch3.value = true;
            }, 1500);
            // Show button after all matches are visible
            setTimeout(() => {
              showButton.value = true;
            }, 2200);
          }, 3000);
        }
      };

      type();
    };

    const goToResults = () => {
      // Store top 3 group IDs for the results page
      const topGroupIds = topMatches.value.map(g => g.id);
      store.setTopMatchIds(topGroupIds);
      
      // Navigate to the first (top) match
      router.push({ name: PageName.RESULTS, params: { groupId: topGroupIds[0] } });
    };

    onMounted(() => {
      const thinkingText = generateThinkingText();
      // Small delay before starting to type
      setTimeout(() => {
        typeText(thinkingText, 40);
      }, 300);
    });

    return {
      displayedText,
      isTyping,
      showRanking,
      showMatch1,
      showMatch2,
      showMatch3,
      showButton,
      goToResults,
      hearts,
      topMatches,
      matchPercentages,
      getGroupImage,
      getTopGenres,
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
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background-hearts {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #E8D5F0;
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
  
  path {
    animation: pulsate 2s ease-in-out infinite;
    transform-origin: center;
    transform-box: fill-box;
  }
}

// Different pulsate timings for each heart group
.heart-0 path {
  animation: pulsate 2.2s ease-in-out infinite;
}

.heart-1 path {
  animation: pulsate 2.8s ease-in-out infinite;
  animation-delay: 0.5s;
}

.heart-2 path {
  animation: pulsate 2.5s ease-in-out infinite;
  animation-delay: 0.8s;
}

.heart-3 path {
  animation: pulsate 3s ease-in-out infinite;
  animation-delay: 0.2s;
}

@keyframes floatUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-120vh);
  }
}

@keyframes pulsate {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px 28px;
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.heading {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Outfit', sans-serif;
  font-size: 60px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: 1px;
  transition: font-size 0.5s ease, font-style 0.5s ease;
  white-space: nowrap;
  
  &.ranking-mode {
    font-size: 48px;
    font-style: italic;
  }
}

.main-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.text-container {
  width: 90%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thinking-text {
  font-family: 'Mulish', sans-serif;
  font-size: 26px;
  font-weight: 400;
  color: #fff;
  line-height: 1.4;
  text-align: center;
  white-space: pre-line;
  margin: 0;
}

.cursor {
  display: inline-block;
  margin-left: 2px;
  color: #fff;
  font-weight: 300;
  
  &.blink {
    animation: blink 1s infinite;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

// Ranking styles
.matches-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 700px;
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
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
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
