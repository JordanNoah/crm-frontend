<template>
    <v-container>
        <VCard>
            <v-container>
                <div class="d-flex align-center mb-5">
                    <v-card height="100" width="100" variant="tonal" elevation="0" class="mr-5 d-flex align-center justify-center">
                        <v-img :src="preview ?? profileImageUrl ?? undefined" v-if="preview || profileImageUrl" />
                        <span v-else>{{ getInitials() }}</span>
                    </v-card>
                    <div>
                        <VBtn class="mb-4" @click="triggerFileInput">Subir una foto</VBtn>
                        <p>Permitido JPG, PNG y GIF.</p>

                        <!-- Input oculto -->
                        <v-file-input v-show="false" label="File input" v-model="file" ref="fileInput"
                            @change="handleFileUpload" accept="image/png, image/jpeg, image/gif"></v-file-input>
                    </div>
                </div>

                <v-form ref="form" @submit.prevent="save">
                    <v-row class="mt-7">
                        <v-col cols="12" md="6">
                            <VTextField label="Nombre" v-model="name" />
                            <EmailTextField v-model="email" />
                            <VTextField label="Telefono" v-model="phone" />
                            <VSelect :items="countriesLocalized" label="País" v-model="country" item-title="name"
                                item-value="id" return-object />
                            <VTextField label="Ciudad/Provincia" v-model="city" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <VTextField label="Apellido" v-model="surname" />
                            <VTextField label="Organización" v-model="organization" readonly />
                            <VTextField label="Dirección" v-model="address" />
                            <VTextField label="Código Postal" v-model="zipCode" />
                            <!-- Lenguajes: múltiple (array de objetos) -->
                            <VSelect :items="languagesLocalized" label="Lenguajes" v-model="selectLanguages"
                                item-title="name" item-value="code" multiple return-object />
                        </v-col>

                        <v-col>
                            <VBtn color="primary" class="mr-4" type="submit">Guardar Cambios</VBtn>
                            <VBtn color="error" @click="reset">Restablecer</VBtn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-container>
        </VCard>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import EmailTextField from '@/components/email-text-field.vue'
import { useSessionStore } from '@/stores/session'
import AuthProvider from '@/core/providers/auth/auth'
import CountryModel from '@/core/model/country.model'
import { LanguageModel } from '@/core/model/languages.model'

export default defineComponent({
    name: 'ProfileView',
    components: { EmailTextField },
    data() {
        return {
            sessionStore: useSessionStore(),
            currentLang: 'es', // puedes cambiarlo por el idioma de sesión si lo tienes
            languages: [] as LanguageModel[],
            countries: [] as CountryModel[],
            timezones: [] as Array<{ code: string; name: string }>,
            preview: null as string | null // Para vista previa de la imagen
        }
    },
    mounted() {
        this.getCountries()
        this.getLanguages()
    },
    watch: {
        'sessionStore.account': {
            handler() {
                console.log('Account changed:', this.sessionStore.getAccount)
            },
            deep: true
        }
    },
    computed: {
        // --- Account fields ---
        name: {
            get(): string {
                return this.sessionStore.getAccount?.firstName || ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.account = { ...(state.account || {}), firstName: value }
                })
            }
        },
        surname: {
            get(): string {
                return this.sessionStore.getAccount?.lastName || ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.account = { ...(state.account || {}), lastName: value }
                })
            }
        },
        email: {
            get(): string {
                return this.sessionStore.getAccount?.email || ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.account = { ...(state.account || {}), email: value }
                })
            }
        },
        phone: {
            get(): string {
                return this.sessionStore.getAccount?.phoneNumber || ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.account = { ...(state.account || {}), phoneNumber: value }
                })
            }
        },
        city: {
            get(): string {
                return this.sessionStore.getAccount?.state || ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.account = { ...(state.account || {}), state: value }
                })
            }
        },
        zipCode: {
            get(): string {
                return this.sessionStore.getAccount?.zipCode || ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.account = { ...(state.account || {}), zipCode: value }
                })
            }
        },
        timezone: {
            get(): string {
                return ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.account = { ...(state.account || {}), timezone: value }
                })
            }
        },
        address: {
            get(): string {
                return this.sessionStore.getAccount?.address || ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.account = { ...(state.account || {}), address: value }
                })
            }
        },
        profileImageUrl() {
            return this.sessionStore.getAccount?.profileImageUrl
        },

        // --- Company ---
        organization: {
            get(): string {
                return this.sessionStore.getCompany?.commercialName || ''
            },
            set(value: string) {
                this.sessionStore.$patch((state: any) => {
                    state.company = { ...(state.company || {}), commercialName: value }
                })
            }
        },

        // --- Lista de países localizada (agrega .name) ---
        countriesLocalized() {
            return this.countries.map((c: CountryModel) => {
                // 👇 busca primero el idioma actual, si no encuentra, cae a 'es'
                const name = c.translations[this.currentLang] ?? c.translations['es'];
                return { ...c, name };
            });
        },

        // --- Lista de idiomas localizada (agrega .name) ---
        languagesLocalized() {
            return this.languages.map((l: LanguageModel) => {
                // 👇 busca primero el idioma actual, si no encuentra, cae a 'es'
                const name = l.translations[this.currentLang] ?? l.translations['es'];
                return { ...l, name };
            });
        },

        // --- Country como objeto (return-object) ---
        country: {
            get(): CountryModel | null {
                console.log("Getting country:", this.sessionStore.getAccount?.country);
                return this.sessionStore.getAccount?.country || null
            },
            set(value: CountryModel | null) {
                if (this.sessionStore.getAccount) {
                    this.sessionStore.setCountry(value) // guarda el objeto completo en el store
                }
            }
        },

        // --- Languages múltiples como objetos (return-object + multiple) ---
        selectLanguages: {
            // devolvemos objetos para que el VSelect pinte chips/labels correctos
            get(): LanguageModel[] {
                if (this.sessionStore.getAccount) {
                    return this.sessionStore.getAccount.languages
                } else {
                    return []
                }
            },
            // recibimos objetos y guardamos solo los códigos en el store
            set(values: LanguageModel[]) {
                if (this.sessionStore.getAccount) {
                    this.sessionStore.setLanguages(values)
                }
            }
        },

        file: {
            get(): File | null {
                return this.sessionStore.getAccount?.file || null
            },
            set(value: File | null) {
                if (this.sessionStore.getAccount) {
                    this.sessionStore.$patch((state: any) => {
                        state.account = { ...(state.account || {}), file: value }
                    })
                }
            }
        }
    },
    methods: {
        reset() {
            const acc = this.sessionStore.getAccount || {}
            console.log('reset form')
        },
        async save() {
            const profile = this.sessionStore.getAccount
            console.log(profile);

            await AuthProvider.updateProfile(profile!)
        },
        async getCountries() {
            const countries = await AuthProvider.getCountries()
            this.countries = countries
        },
        async getLanguages() {
            const languages = await AuthProvider.getLanguages()
            this.languages = languages
        },
        triggerFileInput() {
            (this.$refs.fileInput as HTMLInputElement).click();
        },
        handleFileUpload(event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                this.preview = URL.createObjectURL(file);
            }
        },
        getInitials() {
            const account = this.sessionStore.getAccount
            const first = (account?.firstName ?? '').trim().split(' ')[0] || ''
            const last = (account?.lastName ?? '').trim().split(' ')[0] || ''

            const initials = (first.charAt(0) + last.charAt(0)).toUpperCase()
            return initials
        },
    }
})
</script>
