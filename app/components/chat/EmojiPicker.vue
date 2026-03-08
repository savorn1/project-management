<template>
  <div
    class="flex flex-col bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
    style="width:300px;max-height:360px"
    @click.stop
  >
    <!-- Search -->
    <div class="px-3 pt-2.5 pb-2 border-b border-slate-700/40 flex-shrink-0">
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref="searchRef"
          v-model="query"
          placeholder="Search emoji…"
          class="w-full pl-7 pr-3 py-1.5 bg-slate-700/50 border border-slate-600/30 rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
        />
      </div>
    </div>

    <!-- Category tabs (hidden during search) -->
    <div v-if="!query" class="flex gap-0.5 px-2 pt-1.5 pb-1 flex-shrink-0 overflow-x-auto scrollbar-none">
      <button
        v-for="cat in categories"
        :key="cat.name"
        @click="activeCategory = cat.name"
        class="flex-shrink-0 px-2 py-1 rounded-lg text-sm transition-colors"
        :class="activeCategory === cat.name
          ? 'bg-indigo-500/20 text-indigo-300'
          : 'text-gray-600 hover:text-gray-300 hover:bg-slate-700/50'"
        :title="cat.name"
      >{{ cat.icon }}</button>
    </div>

    <!-- Emoji grid -->
    <div class="flex-1 overflow-y-auto px-2 pb-2 pt-1">
      <!-- Search results -->
      <template v-if="query">
        <div v-if="searchResults.length === 0" class="flex items-center justify-center h-16 text-xs text-gray-600">
          No results for "{{ query }}"
        </div>
        <div v-else class="flex flex-wrap gap-0.5">
          <button
            v-for="emoji in searchResults"
            :key="emoji.char"
            @click="$emit('pick', emoji.char)"
            class="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-700/60 transition-colors"
            :title="emoji.name"
          >{{ emoji.char }}</button>
        </div>
      </template>

      <!-- Category emojis -->
      <template v-else>
        <p class="text-[9px] font-semibold uppercase tracking-wider text-gray-600 mb-1 mt-0.5">
          {{ activeCategory }}
        </p>
        <div class="flex flex-wrap gap-0.5">
          <button
            v-for="emoji in activeCategoryEmojis"
            :key="emoji.char"
            @click="$emit('pick', emoji.char)"
            class="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-700/60 transition-colors"
            :title="emoji.name"
          >{{ emoji.char }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ pick: [emoji: string] }>()

const query = ref('')
const searchRef = ref<HTMLInputElement | null>(null)

onMounted(() => nextTick(() => searchRef.value?.focus()))

// ── Emoji data ────────────────────────────────────────────────────────────────

interface EmojiEntry { char: string; name: string; keywords?: string }

const categories: { name: string; icon: string; emojis: EmojiEntry[] }[] = [
  {
    name: 'Smileys',
    icon: '😀',
    emojis: [
      { char: '😀', name: 'grinning' }, { char: '😃', name: 'big smile' },
      { char: '😄', name: 'smile eyes' }, { char: '😁', name: 'grin' },
      { char: '😆', name: 'laughing' }, { char: '😅', name: 'sweat smile' },
      { char: '🤣', name: 'rofl' }, { char: '😂', name: 'joy' },
      { char: '🙂', name: 'slightly smiling' }, { char: '🙃', name: 'upside down' },
      { char: '😉', name: 'wink' }, { char: '😊', name: 'blush' },
      { char: '😇', name: 'halo' }, { char: '🥰', name: 'love' },
      { char: '😍', name: 'heart eyes' }, { char: '🤩', name: 'star struck' },
      { char: '😘', name: 'kiss' }, { char: '😗', name: 'kissing' },
      { char: '😚', name: 'kissing closed' }, { char: '😙', name: 'kissing smile' },
      { char: '🥲', name: 'tear of joy' }, { char: '😋', name: 'yum' },
      { char: '😛', name: 'tongue' }, { char: '😜', name: 'winking tongue' },
      { char: '🤪', name: 'zany' }, { char: '😝', name: 'squinting tongue' },
      { char: '🤑', name: 'money mouth' }, { char: '🤗', name: 'hugging' },
      { char: '🤭', name: 'hand over mouth' }, { char: '🤫', name: 'shushing' },
      { char: '🤔', name: 'thinking' }, { char: '🤐', name: 'zipper mouth' },
      { char: '🤨', name: 'raised eyebrow' }, { char: '😐', name: 'neutral' },
      { char: '😑', name: 'expressionless' }, { char: '😶', name: 'no mouth' },
      { char: '😏', name: 'smirk' }, { char: '😒', name: 'unamused' },
      { char: '🙄', name: 'eye roll' }, { char: '😬', name: 'grimace' },
      { char: '🤥', name: 'lying' }, { char: '😌', name: 'relieved' },
      { char: '😔', name: 'pensive' }, { char: '😪', name: 'sleepy' },
      { char: '🤤', name: 'drooling' }, { char: '😴', name: 'sleeping' },
      { char: '😷', name: 'mask' }, { char: '🤒', name: 'sick' },
      { char: '🤕', name: 'injured' }, { char: '🤢', name: 'nauseated' },
      { char: '🤧', name: 'sneezing' }, { char: '🥵', name: 'hot' },
      { char: '🥶', name: 'cold' }, { char: '🥴', name: 'woozy' },
      { char: '😵', name: 'dizzy' }, { char: '🤯', name: 'exploding head' },
      { char: '🤠', name: 'cowboy' }, { char: '🥳', name: 'party' },
      { char: '🥸', name: 'disguised' }, { char: '😎', name: 'sunglasses' },
      { char: '🤓', name: 'nerd' }, { char: '🧐', name: 'monocle' },
      { char: '😕', name: 'confused' }, { char: '😟', name: 'worried' },
      { char: '🙁', name: 'slightly frowning' }, { char: '☹️', name: 'frowning' },
      { char: '😮', name: 'open mouth' }, { char: '😯', name: 'hushed' },
      { char: '😲', name: 'astonished' }, { char: '😳', name: 'flushed' },
      { char: '🥺', name: 'pleading' }, { char: '😦', name: 'frowning open' },
      { char: '😧', name: 'anguished' }, { char: '😨', name: 'fearful' },
      { char: '😰', name: 'anxious sweat' }, { char: '😥', name: 'sad' },
      { char: '😢', name: 'crying' }, { char: '😭', name: 'loudly crying' },
      { char: '😱', name: 'screaming' }, { char: '😖', name: 'confounded' },
      { char: '😣', name: 'persevere' }, { char: '😞', name: 'disappointed' },
      { char: '😓', name: 'downcast sweat' }, { char: '😩', name: 'weary' },
      { char: '😫', name: 'tired' }, { char: '🥱', name: 'yawning' },
      { char: '😤', name: 'steam' }, { char: '😡', name: 'pouting' },
      { char: '😠', name: 'angry' }, { char: '🤬', name: 'cursing' },
      { char: '😈', name: 'smiling devil' }, { char: '👿', name: 'angry devil' },
      { char: '💀', name: 'skull' }, { char: '☠️', name: 'skull crossbones' },
      { char: '💩', name: 'poop' }, { char: '🤡', name: 'clown' },
      { char: '👹', name: 'ogre' }, { char: '👺', name: 'goblin' },
      { char: '👻', name: 'ghost' }, { char: '👽', name: 'alien' },
      { char: '🤖', name: 'robot' }, { char: '😺', name: 'smiling cat' },
    ],
  },
  {
    name: 'Gestures',
    icon: '👋',
    emojis: [
      { char: '👋', name: 'wave' }, { char: '🤚', name: 'raised back hand' },
      { char: '🖐️', name: 'hand splayed' }, { char: '✋', name: 'raised hand' },
      { char: '🖖', name: 'vulcan' }, { char: '👌', name: 'ok hand' },
      { char: '🤌', name: 'pinched fingers' }, { char: '🤏', name: 'pinching hand' },
      { char: '✌️', name: 'victory' }, { char: '🤞', name: 'crossed fingers' },
      { char: '🤟', name: 'love you' }, { char: '🤘', name: 'horns' },
      { char: '🤙', name: 'call me' }, { char: '👈', name: 'point left' },
      { char: '👉', name: 'point right' }, { char: '👆', name: 'point up' },
      { char: '🖕', name: 'middle finger' }, { char: '👇', name: 'point down' },
      { char: '☝️', name: 'index up' }, { char: '👍', name: 'thumbs up' },
      { char: '👎', name: 'thumbs down' }, { char: '✊', name: 'fist' },
      { char: '👊', name: 'oncoming fist' }, { char: '🤛', name: 'left fist' },
      { char: '🤜', name: 'right fist' }, { char: '👏', name: 'clap' },
      { char: '🙌', name: 'raising hands' }, { char: '👐', name: 'open hands' },
      { char: '🤲', name: 'palms up' }, { char: '🤝', name: 'handshake' },
      { char: '🙏', name: 'pray' }, { char: '✍️', name: 'writing' },
      { char: '💅', name: 'nail polish' }, { char: '🤳', name: 'selfie' },
      { char: '💪', name: 'muscle' }, { char: '🦾', name: 'mechanical arm' },
      { char: '🦿', name: 'mechanical leg' }, { char: '🦵', name: 'leg' },
      { char: '🦶', name: 'foot' }, { char: '👂', name: 'ear' },
      { char: '👃', name: 'nose' }, { char: '🫀', name: 'heart organ' },
      { char: '👀', name: 'eyes' }, { char: '👅', name: 'tongue' },
      { char: '👄', name: 'lips' },
    ],
  },
  {
    name: 'Hearts',
    icon: '❤️',
    emojis: [
      { char: '❤️', name: 'red heart' }, { char: '🧡', name: 'orange heart' },
      { char: '💛', name: 'yellow heart' }, { char: '💚', name: 'green heart' },
      { char: '💙', name: 'blue heart' }, { char: '💜', name: 'purple heart' },
      { char: '🖤', name: 'black heart' }, { char: '🤍', name: 'white heart' },
      { char: '🤎', name: 'brown heart' }, { char: '💔', name: 'broken heart' },
      { char: '❤️‍🔥', name: 'heart on fire' }, { char: '❤️‍🩹', name: 'mending heart' },
      { char: '❣️', name: 'heart exclamation' }, { char: '💕', name: 'two hearts' },
      { char: '💞', name: 'revolving hearts' }, { char: '💓', name: 'beating heart' },
      { char: '💗', name: 'growing heart' }, { char: '💖', name: 'sparkling heart' },
      { char: '💘', name: 'heart arrow' }, { char: '💝', name: 'heart ribbon' },
      { char: '💟', name: 'heart decoration' }, { char: '☮️', name: 'peace' },
      { char: '✝️', name: 'cross' }, { char: '☯️', name: 'yin yang' },
      { char: '🕊️', name: 'dove' }, { char: '🔯', name: 'star of david' },
    ],
  },
  {
    name: 'Nature',
    icon: '🌿',
    emojis: [
      { char: '🌸', name: 'cherry blossom' }, { char: '💮', name: 'white flower' },
      { char: '🏵️', name: 'rosette' }, { char: '🌹', name: 'rose' },
      { char: '🥀', name: 'wilted flower' }, { char: '🌺', name: 'hibiscus' },
      { char: '🌻', name: 'sunflower' }, { char: '🌼', name: 'blossom' },
      { char: '🌷', name: 'tulip' }, { char: '🌱', name: 'seedling' },
      { char: '🪴', name: 'plant' }, { char: '🌲', name: 'evergreen' },
      { char: '🌳', name: 'tree' }, { char: '🌴', name: 'palm tree' },
      { char: '🌵', name: 'cactus' }, { char: '🌾', name: 'sheaf of rice' },
      { char: '🍄', name: 'mushroom' }, { char: '🪨', name: 'rock' },
      { char: '🪵', name: 'wood' }, { char: '🐶', name: 'dog' },
      { char: '🐱', name: 'cat' }, { char: '🐭', name: 'mouse' },
      { char: '🐹', name: 'hamster' }, { char: '🐰', name: 'rabbit' },
      { char: '🦊', name: 'fox' }, { char: '🐻', name: 'bear' },
      { char: '🐼', name: 'panda' }, { char: '🐨', name: 'koala' },
      { char: '🐯', name: 'tiger' }, { char: '🦁', name: 'lion' },
      { char: '🐮', name: 'cow' }, { char: '🐷', name: 'pig' },
      { char: '🐸', name: 'frog' }, { char: '🐵', name: 'monkey' },
      { char: '🐔', name: 'chicken' }, { char: '🐧', name: 'penguin' },
      { char: '🐦', name: 'bird' }, { char: '🦆', name: 'duck' },
      { char: '🦅', name: 'eagle' }, { char: '🦉', name: 'owl' },
      { char: '🐬', name: 'dolphin' }, { char: '🐳', name: 'whale' },
      { char: '🦋', name: 'butterfly' }, { char: '🌈', name: 'rainbow' },
    ],
  },
  {
    name: 'Food',
    icon: '🍕',
    emojis: [
      { char: '🍕', name: 'pizza' }, { char: '🍔', name: 'burger' },
      { char: '🍟', name: 'fries' }, { char: '🌭', name: 'hot dog' },
      { char: '🍿', name: 'popcorn' }, { char: '🧂', name: 'salt' },
      { char: '🥓', name: 'bacon' }, { char: '🥚', name: 'egg' },
      { char: '🍳', name: 'cooking' }, { char: '🧇', name: 'waffle' },
      { char: '🥞', name: 'pancakes' }, { char: '🧈', name: 'butter' },
      { char: '🍞', name: 'bread' }, { char: '🥐', name: 'croissant' },
      { char: '🥖', name: 'baguette' }, { char: '🫓', name: 'flatbread' },
      { char: '🧀', name: 'cheese' }, { char: '🥗', name: 'salad' },
      { char: '🍜', name: 'noodles' }, { char: '🍝', name: 'pasta' },
      { char: '🍣', name: 'sushi' }, { char: '🍱', name: 'bento' },
      { char: '🍩', name: 'donut' }, { char: '🍪', name: 'cookie' },
      { char: '🎂', name: 'birthday cake' }, { char: '🍰', name: 'cake' },
      { char: '🧁', name: 'cupcake' }, { char: '🍫', name: 'chocolate' },
      { char: '🍬', name: 'candy' }, { char: '🍭', name: 'lollipop' },
      { char: '☕', name: 'coffee' }, { char: '🧋', name: 'bubble tea' },
      { char: '🍵', name: 'tea' }, { char: '🧃', name: 'juice' },
      { char: '🥤', name: 'cup with straw' }, { char: '🍺', name: 'beer' },
      { char: '🥂', name: 'champagne' }, { char: '🍷', name: 'wine' },
      { char: '🍸', name: 'cocktail' }, { char: '🍹', name: 'tropical drink' },
    ],
  },
  {
    name: 'Activities',
    icon: '⚽',
    emojis: [
      { char: '⚽', name: 'soccer' }, { char: '🏀', name: 'basketball' },
      { char: '🏈', name: 'football' }, { char: '⚾', name: 'baseball' },
      { char: '🎾', name: 'tennis' }, { char: '🏐', name: 'volleyball' },
      { char: '🏉', name: 'rugby' }, { char: '🥏', name: 'frisbee' },
      { char: '🎱', name: 'billiards' }, { char: '🏓', name: 'ping pong' },
      { char: '🏸', name: 'badminton' }, { char: '🥊', name: 'boxing glove' },
      { char: '🏋️', name: 'weight lifting' }, { char: '🎯', name: 'bullseye' },
      { char: '🎲', name: 'dice' }, { char: '🎮', name: 'video game' },
      { char: '🕹️', name: 'joystick' }, { char: '🎰', name: 'slot machine' },
      { char: '🧩', name: 'puzzle' }, { char: '♟️', name: 'chess' },
      { char: '🎭', name: 'performing arts' }, { char: '🎨', name: 'art' },
      { char: '🎬', name: 'clapper' }, { char: '🎤', name: 'microphone' },
      { char: '🎧', name: 'headphone' }, { char: '🎼', name: 'musical score' },
      { char: '🎹', name: 'piano' }, { char: '🥁', name: 'drum' },
      { char: '🎸', name: 'guitar' }, { char: '🎺', name: 'trumpet' },
      { char: '🏆', name: 'trophy' }, { char: '🥇', name: 'gold medal' },
      { char: '🎪', name: 'circus' }, { char: '🎠', name: 'carousel' },
      { char: '🎡', name: 'ferris wheel' }, { char: '🎢', name: 'roller coaster' },
    ],
  },
  {
    name: 'Travel',
    icon: '✈️',
    emojis: [
      { char: '✈️', name: 'airplane' }, { char: '🚀', name: 'rocket' },
      { char: '🛸', name: 'ufo' }, { char: '🚁', name: 'helicopter' },
      { char: '🚂', name: 'train' }, { char: '🚃', name: 'railway car' },
      { char: '🚄', name: 'bullet train' }, { char: '🚅', name: 'high speed train' },
      { char: '🚇', name: 'metro' }, { char: '🚌', name: 'bus' },
      { char: '🚍', name: 'oncoming bus' }, { char: '🚎', name: 'trolleybus' },
      { char: '🏎️', name: 'racing car' }, { char: '🚓', name: 'police car' },
      { char: '🚑', name: 'ambulance' }, { char: '🚒', name: 'fire engine' },
      { char: '🚐', name: 'minibus' }, { char: '🛻', name: 'pickup truck' },
      { char: '🚚', name: 'truck' }, { char: '🚛', name: 'articulated truck' },
      { char: '🏍️', name: 'motorcycle' }, { char: '🛵', name: 'motor scooter' },
      { char: '🚲', name: 'bicycle' }, { char: '⛵', name: 'sailboat' },
      { char: '🚢', name: 'ship' }, { char: '⚓', name: 'anchor' },
      { char: '🗺️', name: 'map' }, { char: '🗼', name: 'tokyo tower' },
      { char: '🗽', name: 'statue of liberty' }, { char: '🏰', name: 'castle' },
      { char: '🏯', name: 'japanese castle' }, { char: '⛩️', name: 'shinto shrine' },
      { char: '🌁', name: 'foggy' }, { char: '🌃', name: 'night with stars' },
      { char: '🌄', name: 'sunrise mountains' }, { char: '🌅', name: 'sunrise' },
      { char: '🌆', name: 'city at dusk' }, { char: '🌇', name: 'sunset' },
      { char: '🌉', name: 'bridge at night' }, { char: '🏖️', name: 'beach' },
    ],
  },
  {
    name: 'Objects',
    icon: '💡',
    emojis: [
      { char: '💡', name: 'light bulb' }, { char: '🔦', name: 'flashlight' },
      { char: '🕯️', name: 'candle' }, { char: '💰', name: 'money bag' },
      { char: '💳', name: 'credit card' }, { char: '💎', name: 'gem' },
      { char: '⚖️', name: 'scales' }, { char: '🔧', name: 'wrench' },
      { char: '🔨', name: 'hammer' }, { char: '⚒️', name: 'hammer and pick' },
      { char: '🛠️', name: 'tools' }, { char: '⛏️', name: 'pick' },
      { char: '🔩', name: 'nut and bolt' }, { char: '🧲', name: 'magnet' },
      { char: '🔫', name: 'pistol' }, { char: '🪃', name: 'boomerang' },
      { char: '🛡️', name: 'shield' }, { char: '🔑', name: 'key' },
      { char: '🗝️', name: 'old key' }, { char: '🔒', name: 'locked' },
      { char: '🔓', name: 'unlocked' }, { char: '📱', name: 'mobile phone' },
      { char: '💻', name: 'laptop' }, { char: '⌨️', name: 'keyboard' },
      { char: '🖥️', name: 'computer' }, { char: '🖨️', name: 'printer' },
      { char: '📷', name: 'camera' }, { char: '📸', name: 'camera flash' },
      { char: '📺', name: 'television' }, { char: '📻', name: 'radio' },
      { char: '📞', name: 'telephone' }, { char: '📟', name: 'pager' },
      { char: '🔋', name: 'battery' }, { char: '🔌', name: 'plug' },
      { char: '📀', name: 'dvd' }, { char: '💿', name: 'cd' },
      { char: '📼', name: 'videocassette' }, { char: '📽️', name: 'film projector' },
      { char: '🎥', name: 'movie camera' }, { char: '📡', name: 'satellite antenna' },
    ],
  },
  {
    name: 'Symbols',
    icon: '✨',
    emojis: [
      { char: '✨', name: 'sparkles' }, { char: '🌟', name: 'glowing star' },
      { char: '⭐', name: 'star' }, { char: '💫', name: 'dizzy star' },
      { char: '🔥', name: 'fire' }, { char: '💥', name: 'boom' },
      { char: '❄️', name: 'snowflake' }, { char: '🌊', name: 'wave' },
      { char: '💧', name: 'droplet' }, { char: '🌪️', name: 'tornado' },
      { char: '⚡', name: 'lightning' }, { char: '☀️', name: 'sun' },
      { char: '🌙', name: 'crescent moon' }, { char: '⛅', name: 'partly cloudy' },
      { char: '🌈', name: 'rainbow' }, { char: '🎉', name: 'party popper' },
      { char: '🎊', name: 'confetti' }, { char: '🎁', name: 'gift' },
      { char: '🎀', name: 'ribbon' }, { char: '🎈', name: 'balloon' },
      { char: '🎆', name: 'fireworks' }, { char: '🎇', name: 'sparkler' },
      { char: '🧨', name: 'firecracker' }, { char: '✅', name: 'check mark' },
      { char: '❌', name: 'cross mark' }, { char: '❓', name: 'question' },
      { char: '❗', name: 'exclamation' }, { char: '💯', name: 'hundred' },
      { char: '🆗', name: 'ok' }, { char: '🆙', name: 'up' },
      { char: '🆕', name: 'new' }, { char: '🔝', name: 'top' },
      { char: '🔞', name: 'no under 18' }, { char: '🚫', name: 'no entry' },
      { char: '⚠️', name: 'warning' }, { char: '♻️', name: 'recycle' },
      { char: '🔴', name: 'red circle' }, { char: '🟠', name: 'orange circle' },
      { char: '🟡', name: 'yellow circle' }, { char: '🟢', name: 'green circle' },
      { char: '🔵', name: 'blue circle' }, { char: '🟣', name: 'purple circle' },
      { char: '⚫', name: 'black circle' }, { char: '⚪', name: 'white circle' },
    ],
  },
]

const activeCategory = ref(categories[0]!.name)

const activeCategoryEmojis = computed(() =>
  categories.find(c => c.name === activeCategory.value)?.emojis ?? []
)

const allEmojis = computed<EmojiEntry[]>(() => categories.flatMap(c => c.emojis))

const searchResults = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return []
  return allEmojis.value.filter(e =>
    e.char === q ||
    e.name.includes(q) ||
    (e.keywords ?? '').includes(q)
  ).slice(0, 60)
})
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { scrollbar-width: none; }
</style>
