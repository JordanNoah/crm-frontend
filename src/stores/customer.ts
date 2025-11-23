import CustomerModel from "@/core/model/customer.model";
import { defineStore } from "pinia";
import AuthProvider from "@/core/providers/auth/auth";

export const useCustomerStore = defineStore("customer", {
    state: () => ({
        customers: [] as CustomerModel[],
        currentCustomer: null as CustomerModel | null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
        },
        loading: false,
        error: null as string | null,
        searchTerm: '',
        searchType: 'global' as 'global' | 'name' | 'email' | 'phone' | 'identification'
    }),
    actions: {
        async loadCustomers(companyId: number, page = 1, limit = 10) {
            this.loading = true;
            this.error = null;
            try {
                const result = await AuthProvider.getCustomersByCompany(companyId, page, limit);
                this.customers = result.data;
                this.pagination = result.pagination;
            } catch (error: any) {
                this.error = error.message || 'Error loading customers';
                console.error('Error loading customers:', error);
            } finally {
                this.loading = false;
            }
        },

        async searchCustomers(companyId: number, searchTerm = '', searchType: 'global' | 'name' | 'email' | 'phone' | 'identification' = 'global', page = 1, limit = 10) {
            this.loading = true;
            this.error = null;
            this.searchTerm = searchTerm;
            this.searchType = searchType;
            
            try {
                const result = await AuthProvider.searchCustomers(companyId, searchTerm, searchType, page, limit);
                this.customers = result.data;
            } catch (error: any) {
                this.error = error.message || 'Error searching customers';
                console.error('Error searching customers:', error);
            } finally {
                this.loading = false;
            }
        },

        async loadCustomerByUuid(uuid: string) {
            this.loading = true;
            this.error = null;
            try {
                this.currentCustomer = await AuthProvider.getCustomerByUuid(uuid);
            } catch (error: any) {
                this.error = error.message || 'Error loading customer';
                console.error('Error loading customer:', error);
            } finally {
                this.loading = false;
            }
        },

        async createCustomer(customer: CustomerModel) {
            this.loading = true;
            this.error = null;
            try {
                const newCustomer = await AuthProvider.createCustomer(customer);
                this.customers.push(newCustomer);
                return newCustomer;
            } catch (error: any) {
                this.error = error.message || 'Error creating customer';
                console.error('Error creating customer:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateCustomer(customer: CustomerModel) {
            this.loading = true;
            this.error = null;
            try {
                const updatedCustomer = await AuthProvider.updateCustomer(customer);
                const index = this.customers.findIndex(c => c.uuid === updatedCustomer.uuid);
                if (index !== -1) {
                    this.customers[index] = updatedCustomer;
                }
                this.currentCustomer = updatedCustomer;
                return updatedCustomer;
            } catch (error: any) {
                this.error = error.message || 'Error updating customer';
                console.error('Error updating customer:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteCustomer(uuid: string) {
            this.loading = true;
            this.error = null;
            try {
                await AuthProvider.deleteCustomer(uuid);
                this.customers = this.customers.filter(c => c.uuid !== uuid);
            } catch (error: any) {
                this.error = error.message || 'Error deleting customer';
                console.error('Error deleting customer:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearCurrentCustomer() {
            this.currentCustomer = null;
        },

        clearError() {
            this.error = null;
        }
    },
    getters: {
        getCustomers: (state) => state.customers,
        getCurrentCustomer: (state) => state.currentCustomer,
        getPagination: (state) => state.pagination,
        isLoading: (state) => state.loading,
        getError: (state) => state.error
    }
});
