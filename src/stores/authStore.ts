import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { apiUrl } from '../config/api';

type User = { id: string; email: string };

async function readJson(res: Response) {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null);
    const user = ref<User | null>(null);

    const isAuthed = computed(() => Boolean(token.value));

    async function register(email: string, password: string) {
      const res = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await readJson(res);
      if (!res.ok) throw data;
      return data;
    }

    async function login(email: string, password: string) {
      const res = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await readJson(res);
      if (!res.ok) throw data;
      token.value = data.token;
      user.value = data.user;
    }

    async function logout() {
      if (token.value) {
        try {
          await fetch(apiUrl('/auth/logout'), {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${token.value}`,
            },
          });
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
