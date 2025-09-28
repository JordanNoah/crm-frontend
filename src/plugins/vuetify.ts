/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { defineComponent, h } from 'vue'

const VHeadText = defineComponent({
  name: 'VHeadText',
  props: {
    tag: { type: String, default: 'h5' },          // h1..h6, p, span, etc.
    variant: { type: String, default: '' },        // ej: 'h5', 'subtitle-1', 'body-1'
    color: { type: String, default: 'head-text' }, // usa tu color del tema
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        props.tag,
        {
          ...attrs,
          class: [
            props.variant ? `text-${props.variant}` : '',
            props.color ? `text-${props.color}` : '',
            'font-weight-medium',
            'text-uppercase',
            attrs.class,
          ],
        },
        slots.default?.()
      )
  },
})

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    defaults: {
        VTextField: {
            variant: 'outlined',
            density: 'compact',
        },
        VCheckbox: {
            density: 'compact',
            color: 'primary',
        },
        VBtn: {
            variant: 'flat',
            color: 'primary',
        },
        VIcon: { 
            color: 'on-background'
        },
        VHeadText: {
            tag: 'h5',
            color: 'head-text',
        },
        VCard: {
            elevation: 0,
            rounded: 'lg',
            variant: 'outlined',
        },
        VSelect: {
            variant: 'outlined',
            density: 'compact',
        },
        VTextarea: {
            variant: 'outlined',
            density: 'compact',
        },
    },
    aliases: {
        SearchTextField: components.VTextField,
        VTextField: components.VTextField,
        VCheckbox: components.VCheckbox,
        VBtn: components.VBtn,
        VIcon: components.VIcon,
        VCard: components.VCard,
        VSelect: components.VSelect,
        VTextarea: components.VTextarea,
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                variables: {
                    'font-family': '"Inter", -apple-system, blinkmacsystemfont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;',
                },
                colors: {
                    background: '#F7F7F9',
                    'on-background': '#3C4056',
                    primary: '#666cff',
                    'head-text': '#a8aab4',
                },
            },
        },
    },
    components: {
        ...components,
        VHeadText,
    },
    directives,
})
