<template>
  <div>
    <textarea :id="editorId" :value="modelValue"></textarea>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: 'editor',
  },
  height: {
    type: Number,
    default: 300,
  }
});

const emit = defineEmits(['update:modelValue']);

const authStore = useAuthStore();
const editorId = ref(props.id + '-' + Math.random().toString(36).substr(2, 9));
let editorInstance = null;

onMounted(() => {
  tinymce.init({
    selector: `#${editorId.value}`,
    height: props.height,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'emoticons'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'emoticons | removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    initial_value: props.modelValue,
    setup: (editor) => {
      editorInstance = editor;

      // Autocompleter cho Hashtag
      editor.ui.registry.addAutocompleter('hashtags', {
        trigger: '#',
        minChars: 0,
        columns: 1,
        fetch: (pattern) => {
          const allTags = authStore.trendingTags
          const filteredTags = allTags
            .filter(tag => tag.toLowerCase().includes(pattern.toLowerCase()))
            .map(tag => ({
              value: tag,
              text: tag
            }))
          
          return new Promise((resolve) => {
            resolve(filteredTags)
          })
        },
        onAction: (autocompleteApi, rng, value) => {
          editor.selection.setRng(rng)
          editor.insertContent(value)
          autocompleteApi.hide()
        }
      });

      // Autocompleter cho Mentions (@)
      editor.ui.registry.addAutocompleter('mentions', {
        trigger: '@',
        minChars: 0,
        columns: 1,
        fetch: (pattern) => {
          const allUsers = authStore.users
          const filteredUsers = allUsers
            .filter(u => u.name.toLowerCase().includes(pattern.toLowerCase()))
            .map(u => ({
              value: u.id.toString(),
              text: u.name,
              meta: { name: u.name }
            }))
          
          return new Promise((resolve) => {
            resolve(filteredUsers)
          })
        },
        onAction: (autocompleteApi, rng, value, meta) => {
          editor.selection.setRng(rng)
          // Chèn link mention với class CSS đặc biệt
          const mentionHtml = `<a href="/profile/${value}" class="mention" data-user-id="${value}">@${meta.name}</a>&nbsp;`
          editor.insertContent(mentionHtml)
          autocompleteApi.hide()
        }
      });

      editor.on('Change KeyUp', () => {
        emit('update:modelValue', editor.getContent());
      });

      editor.on('init', () => {
        if (props.modelValue) {
          editor.setContent(props.modelValue);
        }
      });
    }
  });
});

// Watch for external changes (e.g., loading draft)
watch(() => props.modelValue, (newValue) => {
  if (editorInstance && newValue !== editorInstance.getContent()) {
    editorInstance.setContent(newValue || '');
  }
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.remove();
  }
});
</script>
