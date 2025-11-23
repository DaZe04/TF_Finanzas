<template>
  <div class="custom-select" ref="selectRef">
    <button class="select-button" @click="toggleDropdown" type="button">
      <span class="selected-value">{{ selectedLabel }}</span>
      <svg class="chevron" :class="{ 'is-open': isOpen }" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
    <transition name="fade">
      <ul v-if="isOpen" class="options-list">
        <li
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          :class="{ 'is-selected': modelValue === option.value }"
        >
          {{ option.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => value.every(opt => 'value' in opt && 'label' in opt),
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectRef = ref(null);

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : 'Seleccionar';
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 200px; /* Ancho por defecto, se puede ajustar */
}

.select-button {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.select-button:focus, .select-button:focus-visible {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 92, 153, 0.1);
}

.selected-value {
  color: var(--color-text-primary);
}

.chevron {
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.chevron.is-open {
  transform: rotate(180deg);
}

.options-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.options-list li {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.options-list li:hover {
  background-color: rgba(0, 92, 153, 0.05);
}

.options-list li.is-selected {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>