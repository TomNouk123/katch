<template>
  <div class="receipt-wrapper">
    <div class="receipt" v-if="resultData">
      <!-- Torn top edge -->
      <div class="receipt__torn-edge receipt__torn-edge--top"></div>
      
      <!-- Logo Section -->
      <div class="receipt__header">
        <img :src="logoImg" alt="KATCH" class="receipt__logo" />
        <p class="receipt__tagline">Swipe. Match. Discover</p>
      </div>
      
      <div class="receipt__divider"></div>
      
      <!-- Results Section -->
      <div class="receipt__results">
        <div 
          v-for="(match, index) in resultData.matches" 
          :key="match.id"
          class="receipt__group"
        >
          <div class="receipt__group-header">
            <div class="receipt__group-info">
              <h2 class="receipt__group-name">{{ match.name }}</h2>
              <p class="receipt__fandom">Fandom naam: <span>{{ match.fandomName || 'N/A' }}</span></p>
              <p class="receipt__genres">{{ match.genres?.join(', ') || 'Pop, Dance' }}</p>
            </div>
            <span class="receipt__percentage">{{ match.percentage }}%</span>
          </div>
          
          <div class="receipt__songs" v-if="match.songs && match.songs.length">
            <div 
              v-for="song in match.songs" 
              :key="song.title"
              class="receipt__song"
            >
              <span class="receipt__song-title">{{ song.title }}</span>
              <span class="receipt__song-duration">{{ song.duration }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="receipt__divider receipt__divider--thick"></div>
      
      <!-- Spotify Section -->
      <div class="receipt__footer">
        <h3 class="receipt__spotify-title">SPOTIFY</h3>
        <div class="receipt__divider"></div>
        <div class="receipt__barcode">
          <div class="receipt__barcode-lines"></div>
        </div>
      </div>
      
      <!-- Torn bottom edge -->
      <div class="receipt__torn-edge receipt__torn-edge--bottom"></div>
    </div>
    
    <!-- Loading state -->
    <div class="receipt-loading" v-else-if="loading">
      <div class="receipt-loading__spinner"></div>
      <p>Loading your results...</p>
    </div>
    
    <!-- No result state -->
    <div class="receipt-empty" v-else>
      <p>No results available yet.</p>
      <p class="receipt-empty__hint">Play the game to get your K-pop match!</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import logoImg from '@/assets/images/logos/katch-logo-purple.png';

interface Song {
  title: string;
  duration: string;
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

export default defineComponent({
  name: 'ReceiptPage',
  setup() {
    const resultData = ref<ResultData | null>(null);
    const loading = ref(true);

    const fetchResult = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/result`);
        
        if (response.ok) {
          resultData.value = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch result:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchResult();
    });

    return {
      resultData,
      loading,
      logoImg,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/config/fonts';

.receipt-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  box-sizing: border-box;
}

.receipt {
  background: #f5f5f0;
  width: 100%;
  max-width: 380px;
  border-radius: 4px;
  position: relative;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  font-family: 'Courier New', Courier, monospace;
  
  &__torn-edge {
    position: absolute;
    left: 0;
    right: 0;
    height: 20px;
    background: #f5f5f0;
    
    &--top {
      top: -10px;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath d='M0 20 L5 10 L10 20 L15 10 L20 20 L25 10 L30 20 L35 10 L40 20 L45 10 L50 20 L55 10 L60 20 L65 10 L70 20 L75 10 L80 20 L85 10 L90 20 L95 10 L100 20 L100 20 L0 20 Z' fill='white'/%3E%3C/svg%3E");
      mask-size: 100% 100%;
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath d='M0 20 L5 10 L10 20 L15 10 L20 20 L25 10 L30 20 L35 10 L40 20 L45 10 L50 20 L55 10 L60 20 L65 10 L70 20 L75 10 L80 20 L85 10 L90 20 L95 10 L100 20 L100 20 L0 20 Z' fill='white'/%3E%3C/svg%3E");
      -webkit-mask-size: 100% 100%;
    }
    
    &--bottom {
      bottom: -10px;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath d='M0 0 L5 10 L10 0 L15 10 L20 0 L25 10 L30 0 L35 10 L40 0 L45 10 L50 0 L55 10 L60 0 L65 10 L70 0 L75 10 L80 0 L85 10 L90 0 L95 10 L100 0 L100 0 L0 0 Z' fill='white'/%3E%3C/svg%3E");
      mask-size: 100% 100%;
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath d='M0 0 L5 10 L10 0 L15 10 L20 0 L25 10 L30 0 L35 10 L40 0 L45 10 L50 0 L55 10 L60 0 L65 10 L70 0 L75 10 L80 0 L85 10 L90 0 L95 10 L100 0 L100 0 L0 0 Z' fill='white'/%3E%3C/svg%3E");
      -webkit-mask-size: 100% 100%;
    }
  }
  
  &__header {
    padding: 30px 24px 20px;
    text-align: center;
  }
  
  &__logo {
    height: 60px;
    width: auto;
    margin-bottom: 8px;
  }
  
  &__tagline {
    font-family: 'Georgia', serif;
    font-size: 14px;
    font-style: italic;
    color: #666;
    margin: 0;
    letter-spacing: 1px;
  }
  
  &__divider {
    height: 1px;
    background: #333;
    margin: 0 20px;
    
    &--thick {
      height: 2px;
      margin-top: 20px;
    }
  }
  
  &__results {
    padding: 16px 24px;
  }
  
  &__group {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  &__group-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  
  &__group-info {
    flex: 1;
  }
  
  &__group-name {
    font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #333;
    margin: 0 0 2px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  &__fandom {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    color: #666;
    margin: 0 0 2px 0;
    
    span {
      color: #654EAC;
      font-weight: 700;
    }
  }
  
  &__genres {
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    color: #888;
    margin: 0;
    text-transform: capitalize;
  }
  
  &__percentage {
    font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: #333;
  }
  
  &__songs {
    margin-top: 8px;
  }
  
  &__song {
    display: flex;
    justify-content: space-between;
    font-family: 'Courier New', Courier, monospace;
    font-size: 13px;
    color: #555;
    padding: 2px 0;
    font-style: italic;
  }
  
  &__song-title {
    flex: 1;
  }
  
  &__song-duration {
    margin-left: 16px;
    color: #888;
  }
  
  &__footer {
    padding: 20px 24px 30px;
    text-align: center;
  }
  
  &__spotify-title {
    font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #654EAC;
    margin: 0 0 12px 0;
    letter-spacing: 2px;
  }
  
  &__barcode {
    margin-top: 16px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  &__barcode-lines {
    width: 200px;
    height: 50px;
    background: repeating-linear-gradient(
      90deg,
      #333 0px,
      #333 2px,
      transparent 2px,
      transparent 4px,
      #333 4px,
      #333 5px,
      transparent 5px,
      transparent 8px,
      #333 8px,
      #333 10px,
      transparent 10px,
      transparent 11px,
      #333 11px,
      #333 14px,
      transparent 14px,
      transparent 17px,
      #333 17px,
      #333 18px,
      transparent 18px,
      transparent 20px
    );
  }
}

.receipt-loading {
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

.receipt-empty {
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

