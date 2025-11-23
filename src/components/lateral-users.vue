<template>
    <v-avatar-group :max="maxVisible">
        <v-tooltip
            v-for="account in visibleAccounts"
            :key="account.id"
            :text="`${account.firstName} ${account.lastName}`"
            location="top"
        >
            <template v-slot:activator="{ props }">
                <UserAvatar
                    v-bind="props"
                    :account="account"
                    :size="size"
                    :show-status="showStatus"
                />
            </template>
        </v-tooltip>
        
        <!-- Indicador de usuarios adicionales -->
        <v-tooltip
            v-if="remainingCount > 0"
            :text="`+${remainingCount} more users`"
            location="top"
        >
            <template v-slot:activator="{ props }">
                <v-avatar
                    v-bind="props"
                    :size="size"
                    color="grey-lighten-1"
                >
                    <span class="text-caption font-weight-bold">+{{ remainingCount }}</span>
                </v-avatar>
            </template>
        </v-tooltip>
    </v-avatar-group>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import AccountModel from "@/core/model/account.model";
import UserAvatar from "./UserAvatar.vue";

export default defineComponent({
    name: "LateralUsers",
    components: {
        UserAvatar
    },
    props: {
        accounts: {
            type: Array as PropType<AccountModel[]>,
            required: true
        },
        maxVisible: {
            type: Number,
            default: 3
        },
        size: {
            type: [Number, String],
            default: 32
        },
        showStatus: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const visibleAccounts = computed(() => {
            return props.accounts.slice(0, props.maxVisible);
        });

        const remainingCount = computed(() => {
            return Math.max(0, props.accounts.length - props.maxVisible);
        });

        return {
            visibleAccounts,
            remainingCount
        };
    }
});
</script>