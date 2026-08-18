// Vue Router kütüphanesinden router oluşturma fonksiyonlarını import ediyoruz
import { createRouter, createWebHistory } from 'vue-router'
// Kimlik doğrulama store'unu import ediyoruz (kullanıcı giriş durumunu kontrol etmek için)
import { useAuthStore } from '@/stores/auth'

// Router yapılandırması - Uygulamanın sayfa yönlendirmelerini tanımlar
const router = createRouter({
  // Web geçmişi modunu kullan (tarayıcı geri/ileri butonları çalışır)
  history: createWebHistory(),
  // Tüm sayfa rotalarını tanımlıyoruz
  routes: [
    {
      path: '/login', // URL yolu
      name: 'Login', // Rota adı (programatik yönlendirme için)
      component: () => import('@/views/Login.vue'), // Lazy loading - sayfa ihtiyaç duyulduğunda yüklenir
      meta: { requiresAuth: false, requiresGuest: true } // Meta bilgileri: Giriş yapmamış kullanıcılar için
    },
    {
      path: '/register', // Kayıt sayfası yolu
      name: 'Register',
      component: () => import('@/views/Register.vue'), // Kayıt sayfası bileşeni
      meta: { requiresAuth: false, requiresGuest: true } // Sadece misafir kullanıcılar erişebilir
    },
    {
      path: '/', // Ana sayfa yolu
      name: 'Home',
      component: () => import('@/views/Home.vue'), // Ana sayfa bileşeni
      meta: { requiresAuth: true } // Giriş yapmış kullanıcılar için
    },
    {
      path: '/ciftci/:id', // Çiftçi detay sayfası - :id dinamik parametre
      name: 'CiftciDetail',
      component: () => import('@/views/CiftciDetail.vue'), // Çiftçi detay bileşeni
      props: true, // Route parametrelerini props olarak geçir
      meta: { requiresAuth: true } // Giriş yapmış kullanıcılar için
    },
    {
      path: '/:pathMatch(.*)*', // Tüm eşleşmeyen yollar için (404 sayfası yerine)
      redirect: '/' // Ana sayfaya yönlendir
    }
  ]
})

// Navigation Guard - Her sayfa değişiminde çalışan güvenlik kontrolü
router.beforeEach((to, from, next) => {
  // Auth store'u kullanarak kullanıcı giriş durumunu kontrol ediyoruz
  const authStore = useAuthStore()
  // Gidilecek sayfanın kimlik doğrulama gereksinimlerini alıyoruz
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest

  // Eğer sayfa giriş gerektiriyor ve kullanıcı giriş yapmamışsa
  if (requiresAuth && !authStore.isAuthenticated) {
    // Giriş yapılmamış, login sayfasına yönlendir
    next('/login')
  } 
  // Eğer sayfa misafir gerektiriyor (login/register) ve kullanıcı zaten giriş yapmışsa
  else if (requiresGuest && authStore.isAuthenticated) {
    // Zaten giriş yapılmış, ana sayfaya yönlendir (çift giriş engelleme)
    next('/')
  } 
  // Her şey tamam, sayfaya git
  else {
    next()
  }
})

// Router'ı dışa aktarıyoruz (main.js'de kullanılacak)
export default router

