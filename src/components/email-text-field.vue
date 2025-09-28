<template>
  <VTextField
    :model-value="modelValue"
    label="Correo electrónico"
    type="email"
    name="email"
    :rules="[rules.required, rules.email]"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "EmailTextField",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data: () => ({
    rules: {
      required: (value: string) => !!value || "Requerido.",
      email: (value: string) => {
        if (/^[a-z.-]+@[a-z.-]+\.[a-z]+$/i.test(value)) return true

        return 'Debe ser un correo electrónico válido.'
      },
    },
  }),
})
</script>
