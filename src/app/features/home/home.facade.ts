import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CART_PORT,
  PROFILE_STORE,
  PROMOTION_CATALOG,
  RESTAURANT_CATALOG,
} from '@/shared/core/contracts/domain-tokens';
import { CartPort, ProfileStorePort, PromotionCatalogPort, RestaurantCatalogPort } from '@/shared/core/contracts/app.contracts';
import { MenuItem, Restaurant } from '@/shared/models';

export interface HomeCollection {
  id: string;
  title: string;
  description: string;
  accent: string;
  restaurant: Restaurant;
  items: MenuItem[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class HomeFacade {
  readonly restaurantCatalog = inject(RESTAURANT_CATALOG) as RestaurantCatalogPort;
  readonly promotionCatalog = inject(PROMOTION_CATALOG) as PromotionCatalogPort;
  readonly profileStore = inject(PROFILE_STORE) as ProfileStorePort;
  readonly cartPort = inject(CART_PORT) as CartPort;

  readonly loading = signal(false);
  private readonly searchSignal = signal('');
  private readonly selectedCategorySignal = signal<string | null>(null);
  private readonly favoritesOnlySignal = signal(false);

  readonly restaurants = this.restaurantCatalog.restaurants;
  readonly allMenuItems = computed(() => this.restaurantCatalog.getAllMenuItems());
  readonly categories = computed(() => {
    const categories = new Set(this.restaurants().map((restaurant) => restaurant.category));
    return Array.from(categories);
  });
  readonly featuredCoupons = computed(() => this.promotionCatalog.getAvailableCoupons().slice(0, 2));
  readonly selectedCategory = this.selectedCategorySignal;

  readonly recommendedMenuItems = computed(() => {
    const preferredCuisine = this.profileStore.preferredCuisine();
    const recentSearches = this.profileStore.recentSearches().map((item) => item.toLowerCase());
    const favoriteIds = new Set(this.profileStore.favoriteMenuItemIds());

    return this.allMenuItems()
      .map((item) => {
        const restaurant = this.restaurantCatalog.getRestaurantById(item.restaurantId);
        let score = item.rating ?? 0;
        if (favoriteIds.has(item.id)) score += 3;
        if (preferredCuisine && restaurant?.category === preferredCuisine) score += 2;
        if (
          recentSearches.some(
            (term) =>
              item.name.toLowerCase().includes(term) ||
              item.category.toLowerCase().includes(term) ||
              restaurant?.name.toLowerCase().includes(term),
          )
        ) {
          score += 1.5;
        }
        return { item, score };
      })
      .sort((left, right) => right.score - left.score)
      .map((entry) => entry.item)
      .slice(0, 3);
  });

  readonly recommendedRestaurants = computed(() => {
    const preferredCuisine = this.profileStore.preferredCuisine();
    if (!preferredCuisine) {
      return this.restaurants().slice(0, 3);
    }
    const matches = this.restaurants().filter((restaurant) => restaurant.category === preferredCuisine);
    return (matches.length > 0 ? matches : this.restaurants()).slice(0, 3);
  });

  readonly searchSuggestions = computed(() => {
    const search = this.searchSignal().trim().toLowerCase();
    const baseSuggestions = [
      ...this.restaurants().map((restaurant) => restaurant.name),
      ...this.restaurants().map((restaurant) => restaurant.category),
      ...this.allMenuItems().map((item) => item.name),
    ];
    const uniqueSuggestions = Array.from(new Set(baseSuggestions));
    return search === ''
      ? uniqueSuggestions.slice(0, 5)
      : uniqueSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(search)).slice(0, 5);
  });

  readonly favoriteBundles = computed(() => {
    const bundles = new Map<string, { restaurant: Restaurant; items: MenuItem[]; total: number }>();
    this.profileStore.favoriteMenuItems().forEach((item) => {
      const restaurant = this.restaurantCatalog.getRestaurantById(item.restaurantId);
      if (!restaurant) return;
      const existing = bundles.get(restaurant.id);
      if (existing) {
        existing.items.push(item);
        existing.total += item.price;
        return;
      }
      bundles.set(restaurant.id, { restaurant, items: [item], total: item.price });
    });
    return Array.from(bundles.values()).filter((bundle) => bundle.items.length > 1).slice(0, 3);
  });

  readonly personalizedOffers = computed(() => {
    const preferredCuisine = this.profileStore.preferredCuisine();
    const recentSearches = this.profileStore.recentSearches().map((item) => item.toLowerCase());
    return this.promotionCatalog.getAvailableCoupons().map((coupon) => {
      const restaurant = coupon.restaurantId
        ? this.restaurantCatalog.getRestaurantById(coupon.restaurantId)
        : null;
      const matchesCuisine = preferredCuisine
        ? restaurant?.category === preferredCuisine || recentSearches.includes(preferredCuisine.toLowerCase())
        : false;
      return {
        ...coupon,
        label: matchesCuisine ? 'match perfeito' : restaurant ? `ideal para ${restaurant.name}` : 'uso livre',
        description: matchesCuisine
          ? `${coupon.description} Combinando com sua preferencia por ${preferredCuisine}.`
          : coupon.description,
      };
    });
  });

  readonly continueExploringRestaurants = computed(() => {
    const recentTerms = this.profileStore.recentSearches().map((item) => item.toLowerCase());
    if (recentTerms.length === 0) return [];
    return this.restaurants()
      .filter(
        (restaurant) =>
          recentTerms.some(
            (term) =>
              restaurant.name.toLowerCase().includes(term) ||
              restaurant.category.toLowerCase().includes(term) ||
              restaurant.description.toLowerCase().includes(term),
          ) && !this.recommendedRestaurants().some((item) => item.id === restaurant.id),
      )
      .slice(0, 3);
  });

  readonly thematicCollections = computed<HomeCollection[]>(() => {
    const favoriteItems = this.profileStore.favoriteMenuItems();
    const allItems = this.allMenuItems();
    const collections: HomeCollection[] = [];
    const addCollection = (
      id: string,
      title: string,
      description: string,
      accent: string,
      items: MenuItem[],
    ) => {
      if (items.length === 0) return;
      const restaurant = this.restaurantCatalog.getRestaurantById(items[0].restaurantId);
      if (!restaurant) return;
      collections.push({
        id,
        title,
        description,
        accent,
        restaurant,
        items,
        total: items.reduce((sum, item) => sum + item.price, 0),
      });
    };
    addCollection('pizza-night', 'Noite de pizza', 'Uma selecao pronta para quando bate vontade de um classico italiano.', 'from-orange-500 via-red-500 to-rose-500', allItems.filter((item) => item.restaurantId === '1').slice(0, 2));
    addCollection('fast-lunch', 'Pedido rapido', 'Combo direto ao ponto para matar a fome sem perder tempo.', 'from-amber-400 via-orange-500 to-stone-900', allItems.filter((item) => item.restaurantId === '2').slice(0, 2));
    addCollection('fresh-japanese', 'Fresh japones', 'Uma rota mais leve, fresca e perfeita para repetir durante a semana.', 'from-emerald-400 via-teal-500 to-cyan-500', allItems.filter((item) => item.restaurantId === '3').slice(0, 2));
    if (favoriteItems.length >= 2) {
      addCollection('favorite-mix', 'Mix dos favoritos', 'Seu combo pessoal montado com os itens que voce mais gosta.', 'from-stone-900 via-stone-700 to-orange-500', favoriteItems.slice(0, 3));
    }
    return collections.slice(0, 4);
  });

  readonly filteredRestaurants = computed(() => {
    const search = this.searchSignal().toLowerCase();
    const category = this.selectedCategorySignal();
    return this.restaurants().filter((restaurant) => {
      const matchesSearch =
        search === '' ||
        restaurant.name.toLowerCase().includes(search) ||
        restaurant.description.toLowerCase().includes(search);
      const matchesCategory = category === null || restaurant.category === category;
      const matchesFavorites =
        !this.favoritesOnlySignal() || this.profileStore.isFavoriteRestaurant(restaurant.id);
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  });

  async loadRestaurants() {
    this.loading.set(true);
    try {
      await this.restaurantCatalog.getRestaurants();
    } finally {
      this.loading.set(false);
    }
  }

  setSearch(value: string) {
    this.searchSignal.set(value);
  }

  commitSearch(term: string) {
    this.profileStore.addRecentSearch(term);
  }

  filterByCategory(category: string) {
    this.selectedCategorySignal.set(this.selectedCategorySignal() === category ? null : category);
    this.profileStore.addRecentSearch(category);
  }

  clearFilters() {
    this.selectedCategorySignal.set(null);
    this.favoritesOnlySignal.set(false);
    this.searchSignal.set('');
  }

  toggleFavoritesFilter() {
    this.favoritesOnlySignal.update((value) => !value);
  }

  showOnlyFavorites() {
    return this.favoritesOnlySignal();
  }

  applySuggestion(suggestion: string) {
    this.searchSignal.set(suggestion);
    this.profileStore.addRecentSearch(suggestion);
  }

  clearRecentSearches() {
    this.profileStore.clearRecentSearches();
  }
}
