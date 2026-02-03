import { defineStore } from 'pinia';
import axios from 'axios';
import { computed, ref } from 'vue';
import * as authApi from '../api/auth';

type User = { id: string; email: string };

function unwrapAxiosError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) return data;
    if (error.message) return { message: error.message };
  }
  return error;
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null);
    const user = ref<User | null>(null);

    const isAuthed = computed(() => Boolean(token.value));

    async function register(email: string, password: string) {
      try {
        return await authApi.register(email, password);
      } catch (error) {
        throw unwrapAxiosError(error);
      }
    }

    async function login(email: string, password: string) {
      try {
        const data = await authApi.login(email, password);
        token.value = data.token;
        user.value = data.user;
      } catch (error) {
        throw unwrapAxiosError(error);
      }
    }

    async function logout() {
      if (token.value) {
        try {
          await authApi.logout(token.value);
        } catch (e) {
          console.error('Logout log failed:', e);
        }
      }
      token.value = null;
      user.value = null;
    }

    return {
      token,
      user,
      isAuthed,
      register,
      login,
      logout,
    };
  },
  {
    persist: {
      key: 'noi-algo-viz-auth',
      storage: localStorage,
    },
  }
);
