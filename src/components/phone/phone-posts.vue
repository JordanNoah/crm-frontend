<template>
    <v-container>
        <div class="d-flex justify-end">
            <VBtn @click="dialog = true">Nuevo Post</VBtn>
        </div>
        <div v-if="posts.length > 0" class="mt-5">
            <v-list>
                <v-list-item v-for="post in posts" :key="post.id">
                    <v-list-item-content>
                        <div class="d-flex">
                            <v-list-item-title>{{ post.title }}</v-list-item-title>
                            <v-spacer></v-spacer>
                            <small>{{ post.createdAt! }}</small>
                        </div>
                        <v-list-item-subtitle>{{ post.content }}</v-list-item-subtitle>
                        <div class="pt-4">
                            <VBtn icon="mdi-heart" density="compact" color="white"></VBtn>
                            <VBtn icon="mdi-comment" density="compact" color="white"></VBtn>
                        </div>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            
        </div>
        <PhoneNoPost v-else />
        <v-dialog v-model="dialog" max-width="600px">
            <v-card variant="elevated">
                <v-card-title>Crear Nuevo Post</v-card-title>
                <v-card-text>
                    <v-form ref="form" v-model="valid">
                        <v-text-field label="Título" v-model="title" required></v-text-field>
                        <v-textarea label="Contenido" v-model="content" required></v-textarea>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="dialog = false">Cancelar</v-btn>
                    <v-btn text color="primary" @click="savePost">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
    
<script lang="ts">
import { defineComponent } from 'vue'
import PhoneNoPost from './phone-no-post.vue';
import AuthProvider from '@/core/providers/auth/auth';
import PostModel from '@/core/model/post.model';
import { useSessionStore } from '@/stores/session';
export default defineComponent({
    name: 'PhonePosts',
    data: () => ({
        dialog: false,
        valid: false,
        title: '',
        content: '',
        posts: [] as PostModel[]
    }),
    computed: {
        company() {
            return useSessionStore().company;
        },
        account() {
            return useSessionStore().account;
        }
    },
    components: {
        PhoneNoPost
    },
    watch: {
        company: {
            immediate: true,
            handler(newCompany) {
                if (newCompany) {
                    this.getCompanyPosts();
                }
            }
        }
    },
    methods: {
        async savePost() {
            const result = await (this.$refs.form as any)?.validate?.();
            const valid = typeof result === 'object' ? !!result.valid : !!result;
            
            if (!valid) return;

            const post = new PostModel(
                this.title,
                this.content,
                this.account!.id,
                this.company!.id!
            );
            const response = await AuthProvider.savePost(post);
            console.log(response);
            
            this.dialog = false;
        },
        async getCompanyPosts() {
            if (!this.company) return;
            console.log('Fetching posts for company', this.company);
            
            const posts = await AuthProvider.getCompanyPosts(this.company.id!);
            this.posts = posts;
        }
    }
})
</script>