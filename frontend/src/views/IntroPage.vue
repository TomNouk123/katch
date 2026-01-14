<template>
  <div class="intro-page">
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
      <h1 class="heading">Vind jouw K-pop match!</h1>
      
      <!-- Main content area -->
      <div class="main-area">
        <!-- Text container -->
        <div class="text-container">
          <p class="intro-text">{{ displayedText }}<span class="cursor" :class="{ 'blink': isTyping }">|</span></p>
        </div>
      </div>

      <!-- Button appears after text completes -->
      <transition name="fade">
        <button 
          v-if="showButton" 
          class="start-btn"
          @click="startGame"
        >
          Start
        </button>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PageName } from '@/utils/_Constants';

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

export default defineComponent({
  name: 'IntroPage',
  setup() {
    const router = useRouter();
    const hearts = generateHearts();
    
    const displayedText = ref('');
    const isTyping = ref(true);
    const showButton = ref(false);
    
    const introText = `Je hoeft niks van K-pop te weten om te beginnen.
Swipe gewoon de artiesten en genres die jij leuk vindt.
Wij matchen je met een K-pop groep die bij jouw smaak past.`;

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
          // Typing complete - show button
          isTyping.value = false;
          setTimeout(() => {
            showButton.value = true;
          }, 500);
        }
      };

      type();
    };

    const startGame = () => {
      router.push({ name: PageName.SWIPE_GAME });
    };

    onMounted(() => {
      // Small delay before starting to type
      setTimeout(() => {
        typeText(introText, 40);
      }, 300);
    });

    return {
      displayedText,
      isTyping,
      showButton,
      startGame,
      hearts,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/config/fonts';

.intro-page {
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
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: 1px;
  white-space: nowrap;
  font-style: italic;
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

.intro-text {
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

.start-btn {
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

// Fade transition for button
.fade-enter-active {
  transition: opacity 0.5s ease-out;
}

.fade-enter-from {
  opacity: 0;
}
</style>

