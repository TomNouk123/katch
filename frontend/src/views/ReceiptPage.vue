<template>
  <div class="cards-page">
    <!-- Background -->
    <div class="background">
      <div class="background__gradient"></div>
    </div>

    <!-- Cards Container -->
    <div class="cards-container" v-if="cards.length > 0">
      <!-- Header -->
      <div class="header">
        <h1 class="header__title">Jouw K-pop Cards</h1>
      </div>

      <!-- Card Display -->
      <div class="card-wrapper">
        <div 
          class="card" 
          :class="{ 
            'card--flipped': cards[activeCardIndex]?.isFlipped,
            'card--no-animation': !isAnimating
          }"
          @click="flipCard"
        >
          <!-- Card Back (Logo) -->
          <div class="card__face card__face--back">
            <div class="card__back-content">
              <div class="card__back-header">
                <span class="card__group-name">{{ cards[activeCardIndex]?.groupName }}</span>
                <img 
                  :src="cards[activeCardIndex]?.logoUrl" 
                  :alt="cards[activeCardIndex]?.groupName"
                  class="card__logo"
                />
              </div>
              <div class="card__back-info">
                <p class="card__fandom">Fandom: {{ cards[activeCardIndex]?.fandomName }}</p>
                <p class="card__genres">{{ cards[activeCardIndex]?.genres?.join(', ') }}</p>
              </div>
              <div class="card__tap-hint">
                <span class="card__tap-text">Tap to reveal!</span>
                <div class="card__heart">
                  <svg viewBox="0 0 24 24" width="60" height="60">
                    <path 
                      fill="#654EAC" 
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                </div>
              </div>
              <div class="card__back-songs">
                <p class="card__songs-title">Biggest hits:</p>
                <div 
                  v-for="song in cards[activeCardIndex]?.songs?.slice(0, 3)" 
                  :key="song.title"
                  class="card__song"
                >
                  <span class="card__song-title">{{ song.title }}</span>
                  <span class="card__song-duration">{{ song.duration }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Front (Member) -->
          <div class="card__face card__face--front">
            <div class="card__front-image" :style="{ backgroundImage: `url(${cards[activeCardIndex]?.memberCardUrl})` }">
              <div class="card__front-overlay"></div>
              <div class="card__front-content">
                <h2 class="card__member-name">{{ cards[activeCardIndex]?.memberName }}</h2>
                <p class="card__member-name-kr">({{ cards[activeCardIndex]?.memberNameKr }})</p>
                <p class="card__member-birthdate">{{ cards[activeCardIndex]?.memberBirthdate || '' }}</p>
                <p class="card__member-nationality">{{ cards[activeCardIndex]?.memberNationality || 'Koreaans' }}</p>
                <p class="card__member-role">{{ cards[activeCardIndex]?.memberRole }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Navigation Dots -->
      <div class="card-nav">
        <button 
          v-for="(card, index) in cards" 
          :key="card.groupId"
          class="card-nav__dot"
          :class="{ 'card-nav__dot--active': activeCardIndex === index }"
          @click="switchCard(index)"
        >
          <span class="card-nav__label">{{ card.groupName }}</span>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div class="loading" v-else-if="loading">
      <div class="loading__spinner"></div>
      <p>Loading your cards...</p>
    </div>

    <!-- No result state -->
    <div class="empty" v-else>
      <p>No results available yet.</p>
      <p class="empty__hint">Play the game to get your K-pop cards!</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import kpopGroupsData from '@/assets/data/kpop-groups.json';

interface Song {
  title: string;
  duration: string;
}

interface Member {
  name: string;
  nameKr: string;
  birthdate?: string;
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
  tags: string[];
  songs: Song[];
  members: Member[];
}

interface CardData {
  groupId: string;
  groupName: string;
  fandomName: string;
  genres: string[];
  songs: Song[];
  logoUrl: string;
  memberName: string;
  memberNameKr: string;
  memberRole: string;
  memberBirthdate: string;
  memberNationality: string;
  memberCardUrl: string;
  isFlipped: boolean;
}

interface MatchResult {
  id: string;
  name: string;
  percentage: number;
  fandomName?: string;
  genres?: string[];
  songs?: Song[];
}

interface ResultData {
  matches: MatchResult[];
  timestamp: string;
}

// Import all card images
const cardImages = import.meta.glob('@/assets/images/cards/**/*.jpg', { eager: true, as: 'url' });

// Import all logo images
const logoImages = import.meta.glob('@/assets/images/logos/*.png', { eager: true, as: 'url' });

// Helper to get card image URL
const getCardImageUrl = (groupId: string, memberName: string): string => {
  const normalizedName = memberName.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(/-/g, '');
  
  for (const [key, url] of Object.entries(cardImages)) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes(`/${groupId}/`) && keyLower.includes(`${normalizedName}-card`)) {
      return url;
    }
  }
  
  // Fallback: try matching just the member name
  for (const [key, url] of Object.entries(cardImages)) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes(`/${groupId}/`)) {
      const fileName = keyLower.split('/').pop() || '';
      if (fileName.startsWith(normalizedName)) {
        return url;
      }
    }
  }
  
  return '';
};

// Helper to get logo image URL
const getLogoUrl = (groupId: string): string => {
  for (const [key, url] of Object.entries(logoImages)) {
    if (key.toLowerCase().includes(`${groupId}-logo`)) {
      return url;
    }
  }
  return '';
};

// Get random member from a group
const getRandomMember = (groupId: string): Member | null => {
  const group = kpopGroupsData.groups.find(g => g.id === groupId) as KpopGroup | undefined;
  if (!group || !group.members || group.members.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * group.members.length);
  return group.members[randomIndex];
};

export default defineComponent({
  name: 'ReceiptPage',
  setup() {
    const cards = ref<CardData[]>([]);
    const loading = ref(true);
    const activeCardIndex = ref(0);

    const fetchResult = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/result`);
        
        if (response.ok) {
          const resultData: ResultData = await response.json();
          
          // Create cards for each matched group
          cards.value = resultData.matches.map(match => {
            const group = kpopGroupsData.groups.find(g => g.id === match.id) as KpopGroup | undefined;
            const randomMember = getRandomMember(match.id);
            
            return {
              groupId: match.id,
              groupName: match.name,
              fandomName: match.fandomName || group?.fandomName || 'Fans',
              genres: match.genres || group?.tags || [],
              songs: match.songs || group?.songs || [],
              logoUrl: getLogoUrl(match.id),
              memberName: randomMember?.name || 'Unknown',
              memberNameKr: randomMember?.nameKr || '',
              memberRole: randomMember?.role || '',
              memberBirthdate: randomMember?.birthdate || '',
              memberNationality: 'Koreaans',
              memberCardUrl: randomMember ? getCardImageUrl(match.id, randomMember.name) : '',
              isFlipped: false,
            };
          });
        }
      } catch (error) {
        console.error('Failed to fetch result:', error);
      } finally {
        loading.value = false;
      }
    };

    // Track if we should animate the flip
    const isAnimating = ref(true);

    const flipCard = () => {
      if (cards.value[activeCardIndex.value]) {
        isAnimating.value = true;
        cards.value[activeCardIndex.value].isFlipped = !cards.value[activeCardIndex.value].isFlipped;
      }
    };

    const switchCard = (index: number) => {
      // Disable animation when switching cards
      isAnimating.value = false;
      activeCardIndex.value = index;
    };

    onMounted(() => {
      fetchResult();
    });

    return {
      cards,
      loading,
      activeCardIndex,
      isAnimating,
      flipCard,
      switchCard,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/config/fonts';

.cards-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.background {
  position: fixed;
  inset: 0;
  z-index: 0;
  
  &__gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #654EAC 0%,rgb(165, 145, 226) 50%, #654EAC 100%);
  }
}

.cards-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.header {
  text-align: center;
  margin-bottom: 24px;
  
  &__title {
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 -2px 0;
  }
  
  &__subtitle {
    font-family: 'Mulish', sans-serif;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

.card-wrapper {
  perspective: 1000px;
  width: 100%;
  max-width: 320px;
}

.card {
  position: relative;
  width: 100%;
  aspect-ratio: 2.5 / 4;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &--flipped {
    transform: rotateY(180deg);
  }
  
  &--no-animation {
    transition: none;
  }
  
  &__face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  }
  
  &__face--back {
    background: #fff;
  }
  
  &__face--front {
    transform: rotateY(180deg);
  }
  
  &__back-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
  }
  
  &__back-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }
  
  &__group-name {
    font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
    font-size: 30px;
    font-weight: 800;
    color: #1a1a2e;
    text-transform: uppercase;
  }
  
  &__logo {
    width: 50px;
    height: auto;
    object-fit: contain;
  }
  
  &__back-info {
    margin-bottom: 8px;
  }
  
  &__fandom {
    font-family: 'Mulish', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #654EAC;
    margin: 0 0 0px 0;
  }
  
  &__genres {
    font-family: 'Mulish', sans-serif;
    font-size: 16px;
    color: #333;
    margin: 0;
    text-transform: capitalize;
  }
  
  &__tap-hint {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  &__tap-text {
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 700;
    font-style: italic;
    color: #654EAC;
    margin-bottom: 4px;
  }
  
  &__heart {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  &__back-songs {
    margin-top: auto;
  }
  
  &__songs-title {
    font-family: 'Mulish', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #333;
    margin: 0 0 8px 0;
  }
  
  &__song {
    display: flex;
    justify-content: space-between;
    font-family: 'Mulish', sans-serif;
    font-size: 14px;
    color: #333;
    padding: 0px 0;
  }
  
  &__song-title {
    font-style: italic;
  }
  
  &__song-duration {
    color: #333;
  }
  
  // Front (Member) styles
  &__front-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center top;
    position: relative;
  }
  
  &__front-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 40%,
      rgba(0, 0, 0, 0.8) 100%
    );
  }
  
  &__front-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px;
    color: #fff;
  }
  
  &__member-name {
    font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    margin: 0;
    text-transform: uppercase;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }
  
  &__member-name-kr {
    font-family: 'Mulish', sans-serif;
    font-size: 14px;
    color: rgb(255, 255, 255);
    margin: -8px 0 10px 0;
  }
  
  &__member-birthdate,
  &__member-nationality {
    font-family: 'Mulish', sans-serif;
    font-size: 12px;
    color: rgb(255, 255, 255);
    margin: 0px 0;
  }
  
  &__member-role {
    font-family: 'Mulish', sans-serif;
    font-size: 12px;
    color: rgb(255, 255, 255);
    margin: 0px 0 0 0;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.card-nav {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  
  &__dot {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 20px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.1);
    
    &--active {
      background: rgba(101, 78, 172, 0.8);
    }
    
    &:hover:not(&--active) {
      background: rgba(255, 255, 255, 0.2);
    }
  }
  
  &__label {
    font-family: 'Mulish', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
  }
}

.loading {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  padding: 60px 20px;
  
  &__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  p {
    font-family: 'Mulish', sans-serif;
    font-size: 16px;
    margin: 0;
  }
}

.empty {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  padding: 60px 20px;
  
  p {
    font-family: 'Mulish', sans-serif;
    font-size: 18px;
    margin: 0 0 10px 0;
  }
  
  &__hint {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px !important;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
