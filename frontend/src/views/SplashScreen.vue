<template>
  <div class="splash-screen">
    <!-- Background Images -->
    <div class="background-container">
      <transition-group name="fade">
        <div
          v-for="(artist, index) in artists"
          :key="artist.id"
          v-show="currentIndex === index"
          class="background-image"
          :style="{ backgroundImage: `url(${artist.image})` }"
        />
      </transition-group>
      <div class="background-overlay" />
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Logo -->
      <header class="header">
        <img 
          src="@/assets/images/logos/katch-logo.png" 
          alt="KATCH" 
          class="logo"
        />
        <p class="tagline">Swipe. Match. Discover!</p>
      </header>

      <!-- CTA -->
      <div class="cta-container">
        <button class="cta-button" @click="handleStart">
          CLICK TO START
        </button>
      </div>

      <!-- Artist Info -->
      <transition name="slide-fade" mode="out-in">
        <div class="artist-info" :key="currentArtist.id">
          <h2 class="artist-name-kr">{{ currentArtist.nameKr }}</h2>
          <h3 class="artist-name-en">{{ currentArtist.nameEn }}</h3>
          <p class="artist-details">{{ currentArtist.details }}</p>
          <p class="artist-company">{{ currentArtist.company }}</p>
        </div>
      </transition>

      <!-- Progress Indicators -->
      <div class="progress-indicators">
        <button
          v-for="(artist, index) in artists"
          :key="artist.id"
          class="indicator"
          :class="{ active: currentIndex === index }"
          @click="goToSlide(index)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { PageName } from '@/utils/_Constants';

// Import images
import aespaImg from '@/assets/images/splash/aespa.jpg';
import btsImg from '@/assets/images/splash/bts.jpg';
import lesserafimImg from '@/assets/images/splash/lesserafim.jpg';
import newjeansImg from '@/assets/images/splash/newjeans.jpg';
import enhypenImg from '@/assets/images/splash/enhypen.jpg';
import illitImg from '@/assets/images/splash/illit.jpg';
import itzyImg from '@/assets/images/splash/itzy.jpg';
import straykidsImg from '@/assets/images/splash/straykids.jpg';
import txtImg from '@/assets/images/splash/txt.jpg';

interface Artist {
  id: string;
  nameKr: string;
  nameEn: string;
  details: string;
  company: string;
  image: string;
}

export default defineComponent({
  name: 'SplashScreen',
  setup() {
    const router = useRouter();
    const currentIndex = ref(0);
    let intervalId: number | null = null;

    const artists: Artist[] = [
      {
        id: 'itzy',
        nameKr: '있지',
        nameEn: 'ITZY',
        details: 'YEJI, LIA, RYUJIN, CHAERYEONG, YUNA',
        company: 'JYP ENTERTAINMENT',
        image: itzyImg,
      },
      {
        id: 'lesserafim',
        nameKr: '르세라핌',
        nameEn: 'LE SSERAFIM',
        details: 'SAKURA, KIM CHAEWON, HUH YUNJIN, KAZUHA, HONG EUNCHAE',
        company: 'SOURCE MUSIC',
        image: lesserafimImg,
      },
      {
        id: 'newjeans',
        nameKr: '뉴진스',
        nameEn: 'NewJeans',
        details: 'MINJI, HANNI, DANIELLE, HAERIN, HYEIN',
        company: 'ADOR',
        image: newjeansImg,
      },
      {
        id: 'bts',
        nameKr: '방탄소년단',
        nameEn: 'BTS',
        details: 'RM, JIN, SUGA, J-HOPE, JIMIN, V, JUNGKOOK',
        company: 'BIGHIT MUSIC',
        image: btsImg,
      },
      {
        id: 'aespa',
        nameKr: '에스파',
        nameEn: 'aespa',
        details: 'KARINA, GISELLE, WINTER, NINGNING',
        company: 'SM ENTERTAINMENT',
        image: aespaImg,
      },
      {
        id: 'enhypen',
        nameKr: '엔하이픈',
        nameEn: 'ENHYPEN',
        details: 'HEESEUNG, JAY, JAKE, SUNGHOON, SUNOO, JUNGWON, NI-KI',
        company: 'BELIFT LAB',
        image: enhypenImg,
      },
      {
        id: 'illit',
        nameKr: '아일릿',
        nameEn: 'ILLIT',
        details: 'YUNAH, MINJU, MOKA, WONHEE, IROHA',
        company: 'BELIFT LAB',
        image: illitImg,
      },
      {
        id: 'straykids',
        nameKr: '스트레이 키즈',
        nameEn: 'Stray Kids',
        details: 'BANG CHAN, LEE KNOW, CHANGBIN, HYUNJIN, HAN, FELIX, SEUNGMIN, I.N',
        company: 'JYP ENTERTAINMENT',
        image: straykidsImg,
      },
      {
        id: 'txt',
        nameKr: '투모로우바이투게더',
        nameEn: 'TXT',
        details: 'SOOBIN, YEONJUN, BEOMGYU, TAEHYUN, HUENINGKAI',
        company: 'BIGHIT MUSIC',
        image: txtImg,
      },
    ];

    const currentArtist = computed(() => artists[currentIndex.value]);

    const nextSlide = () => {
      currentIndex.value = (currentIndex.value + 1) % artists.length;
    };

    const goToSlide = (index: number) => {
      currentIndex.value = index;
      // Reset timer when manually navigating
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = window.setInterval(nextSlide, 5000);
      }
    };

    const handleStart = () => {
      router.push({ name: PageName.INTRO });
    };

    onMounted(() => {
      intervalId = window.setInterval(nextSlide, 5000);
    });

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    return {
      artists,
      currentIndex,
      currentArtist,
      goToSlide,
      handleStart,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/config/fonts';

.splash-screen {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
}

.background-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.background-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.4) 70%,
    rgba(0, 0, 0, 0.85) 100%
  );
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 40px 28px;
}

.header {
  text-align: center;

  .logo {
    height: 200px;
    width: auto;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
  }

  .tagline {
    margin-top: 8px;
    font-family: 'Mulish', sans-serif;
    font-size: 32px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.3px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }
}

.cta-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-button {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.9);
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  padding: 14px 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.02);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: scale(0.98);
  }
}

.artist-info {
  padding-bottom: 24px;
  min-height: 140px; // Fixed height to prevent button shifting

  .artist-name-kr {
    font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
    font-size: 36px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    line-height: 1.2;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .artist-name-en {
    font-family: map-get(map-get($fonts, 'avant-garde'), 'bold'), sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin: 4px 0 0 0;
    line-height: 1.2;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .artist-details {
    font-family: 'Mulish', sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.75);
    margin: 14px 0 0 0;
    line-height: 1.5;
    letter-spacing: 0.3px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    white-space: nowrap;
  }

  .artist-company {
    font-family: 'Mulish', sans-serif;
    font-size: 11px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
    margin: 8px 0 0 0;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }
}

.progress-indicators {
  display: flex;
  gap: 6px;
  padding-bottom: 12px;

  .indicator {
    width: 20px;
    height: 2px;
    background: rgba(255, 255, 255, 0.35);
    border: none;
    border-radius: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;

    &.active {
      background: #fff;
      width: 28px;
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.55);
    }
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>

