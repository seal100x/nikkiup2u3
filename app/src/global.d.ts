// 原有 JS 全局变量和函数的类型声明

declare const wardrobe: any[]
declare const category: string[]
declare const clothes: Record<string, any>
declare const competitionsRaw: Record<string, string>

// model.js
declare function loadFromStorage(): any
declare function save(): any
declare function calcDependencies(): void
declare function loadCustomInventory(): void

// nikki.js
declare const criteria: Record<string, any>
declare const uiFilter: Record<string, any>
declare function onChangeCriteria(): void
declare function onChangeUiFilter(): void
declare function filtering(criteria: any, filters: any): any[]
declare function filterTopClothes(filters: any): any[]
declare function refreshTable(): void
declare function refreshShoppingCart(): void
declare function drawFilter(): void
declare function drawTheme(): void
declare function drawLevelInfo(): void
declare function switchCate(c: string): void
declare function changeFilter(): void
declare function changeTheme(): void
declare function toggleInventory(type: string, id: string): void
declare function addShoppingCart(type: string, id: string): void
declare function removeShoppingCart(type: string): void
declare function clearShoppingCart(): void
declare function chooseAccessories(criteria: any): void
declare function setFilters(level: any): void
declare function toggleAll(c: any): void

// sharewardrobe.js
declare function shareWardrobe(): void
declare function getWardrobe(): void

// onekeystrategy.js
declare function drawStrategyInfo(): void
