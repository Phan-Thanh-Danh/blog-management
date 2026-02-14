<template>
  <div>
    <textarea :id="editorId" :value="modelValue"></textarea>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue';

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
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    initial_value: props.modelValue, // Use initial_value for TinyMCE
    setup: (editor) => {
      editorInstance = editor;

      editor.on('Change KeyUp', () => {
        emit('update:modelValue', editor.getContent());
      });

      // Handle the case where props.modelValue updates after init
      editor.on('init', () => {
        if (props.modelValue) {
          editor.setContent(props.modelValue);
        }
      });
    }
  });
});

// Watch for external changes to modelValue (e.g., loading draft)
watch(() => props.modelValue, (newValue) => {
  if (editorInstance && newValue !== editorInstance.getContent()) {
    editorInstance.setContent(newValue);
  }
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.remove();
  }
});
</script>
