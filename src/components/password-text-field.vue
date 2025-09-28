<template>
  <VTextField
    :model-value="modelValue"
    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
    :rules="[rules.required, rules.min]"
    :type="showPassword ? 'text' : 'password'"
    hint="At least 8 characters"
    label="Contraseña"
    name="password"
    counter
    @click:append-inner="showPassword = !showPassword"
    @update:model-value="updateValue"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

export default defineComponent({
  name: "PasswordTextField",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data: () => ({
    showPassword: false,
    rules: {
      required: (value: string) => !!value || "Required.",
      min: (value: string) => (value && value.length >= 8) || "Min 8 characters",
    },
  }),
  methods: {
    updateValue(value: string) {
      this.$emit("update:modelValue", value)
    },
  },
})
</script>
