<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PageName } from '@/utils/_Constants';

export default defineComponent({
  name: 'IntroPage',
  setup() {
    const router = useRouter();

    onMounted(() => {
      // Redirect to SwipeGame with intro overlay
      router.replace({ name: PageName.SWIPE_GAME });
    });

    return {};
  },
});
</script>
