<template>
  <div class="results-page">
    <div class="results-content" v-if="group">
      <!-- Header -->
      <header class="header">
        <h1 class="header__title">Jouw K-pop match!</h1>
      </header>

      <!-- Group Card with Image + Black Info Section -->
      <div class="group-card">
        <!-- Group Image -->
        <div class="group-image">
          <img :src="getGroupImage(group.image)" :alt="group.name" />
          <div class="group-image__gradient" />
        </div>
        
        <!-- Black Info Section -->
        <div class="group-info">
          <h2 class="group-name">{{ group.name }}</h2>
          <p class="group-members">{{ memberNames }}</p>
          <p class="group-company">COMPANY: {{ group.company }}</p>
          <p class="group-description">{{ group.description }}</p>

          <!-- Spotify Button -->
          <a :href="group.spotifyUrl" target="_blank" class="spotify-btn">
            <div class="spotify-qr">
              <div class="qr-placeholder"></div>
            </div>
            <div class="spotify-text">
              <span>Bezoek de</span>
              <span>spotify pagina</span>
            </div>
          </a>

          <!-- Members Section -->
          <div class="members-section">
            <h3 class="members-title">LEDEN</h3>
            
            <div class="members-list">
              <div 
                v-for="member in group.members" 
                :key="member.name"
                class="member-card"
              >
                <div class="member-image">
                  <img :src="getMemberImage(member.image)" :alt="member.name" />
                </div>
                <div class="member-info">
                  <h4 class="member-name">{{ member.name.toUpperCase() }} <span class="member-name-kr">({{ member.nameKr }})</span></h4>
                  <p class="member-role">{{ member.role }}</p>
                  <p class="member-description">{{ member.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Replay Button -->
      <button class="replay-btn" @click="goHome">
        Opnieuw spelen
      </button>
    </div>

    <!-- Loading State -->
    <div v-else class="loading">
      <p>Je match wordt berekend...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import kpopGroupsData from '@/assets/data/kpop-groups.json';
import { PageName } from '@/utils/_Constants';

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
  description: string;
  spotifyUrl: string;
  image: string;
  tags: string[];
  members: Member[];
}

// Import all kpop group images
const groupImages = import.meta.glob('@/assets/images/kpop-groups/**/*', { eager: true, as: 'url' });

export default defineComponent({
  name: 'ResultsPage',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const group = computed<KpopGroup | undefined>(() => {
      const groupId = route.params.groupId as string;
      return kpopGroupsData.groups.find(g => g.id === groupId) as KpopGroup | undefined;
    });

    const memberNames = computed(() => {
      if (!group.value) return '';
      return group.value.members.map(m => m.name.toUpperCase()).join(', ');
    });

    const getGroupImage = (imagePath: string) => {
      for (const [key, url] of Object.entries(groupImages)) {
        if (key.includes(imagePath)) {
          return url;
        }
      }
      return '';
    };

    const getMemberImage = (imagePath: string) => {
      for (const [key, url] of Object.entries(groupImages)) {
        if (key.includes(imagePath)) {
          return url;
        }
      }
      return '';
    };

    const goHome = () => {
      router.push({ name: PageName.HOME });
    };

    return {
      group,
      memberNames,
      getGroupImage,
      getMemberImage,
      goHome,
    };
  },
});
</script>

<style lang="scss" scoped>
.results-page {
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
}

.results-content {
  width: 100%;
  padding: 50px;
}

.header {
  text-align: center;
  margin-bottom: 32px;

  &__title {
    font-family: 'Outfit', sans-serif;
    font-size: 42px;
    font-weight: 600;
    font-style: italic;
    color: #8b5cf6;
    margin: 0;
  }
}

.group-card {
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 24px;
}

.group-image {
  width: 100%;
  height: 700px;
  position: relative;
  line-height: 0;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__gradient {
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(to bottom, transparent 0%, #000 100%);
  }
}

.group-info {
  background: #000;
  padding: 24px 24px 40px;
  text-align: center;
}

.group-name {
  font-family: 'Outfit', sans-serif;
  font-size: 64px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.group-members {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
}

.group-company {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 24px 0;
  letter-spacing: 0.5px;
}

.group-description {
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.7;
  text-align: center;
}

.spotify-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  margin: 32px 0 48px;
  text-align: left;
}

.spotify-qr {
  flex-shrink: 0;

  .qr-placeholder {
    width: 100px;
    height: 100px;
    background: #fff;
    border-radius: 8px;
    // QR code pattern simulation
    background-image: 
      linear-gradient(45deg, #000 25%, transparent 25%),
      linear-gradient(-45deg, #000 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #000 75%),
      linear-gradient(-45deg, transparent 75%, #000 75%);
    background-size: 10px 10px;
    background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  }
}

.spotify-text {
  display: flex;
  flex-direction: column;
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.members-section {
  text-align: left;
}

.members-title {
  font-family: 'Outfit', sans-serif;
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 36px 0;
  letter-spacing: 1px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.member-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.member-image {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.member-info {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.member-name {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
}

.member-name-kr {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.member-role {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 12px 0;
  letter-spacing: 0.3px;
}

.member-description {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
}

.replay-btn {
  width: 100%;
  background: #8b5cf6;
  border: none;
  border-radius: 16px;
  padding: 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #7c3aed;
    transform: translateY(-2px);
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  
  p {
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    color: #333;
  }
}
</style>
