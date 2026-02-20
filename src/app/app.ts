import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, CAC40_PRODUCTS } from './data/cac40.data';
import { CountMinSketch } from './models/cmsk.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <aside class="sidebar">
        <div class="logo">
          <h1>CMS<span>k</span></h1>
          <p>Count-Min Sketch Visualizer</p>
        </div>
        
        <div class="search-box">
          <input type="text" placeholder="Rechercher un produit..." (input)="filterProducts($event)">
        </div>

        <div class="product-list">
          <div 
            *ngFor="let product of filteredProducts" 
            class="product-item" 
            (click)="incrementProduct(product)"
            [class.active]="lastClickedProduct?.isin === product.isin"
          >
            <div class="product-info">
              <span class="product-symbol">{{ product.symbol }}</span>
              <span class="product-name">{{ product.name }}</span>
            </div>
            <span class="product-isin">{{ product.isin }}</span>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <header>
          <div class="stats-container">
            <div class="stat-card" *ngFor="let top of topProducts; let i = index">
              <div class="stat-rank">#{{ i + 1 }}</div>
              <div class="stat-content">
                <div class="stat-header">
                  <span class="stat-symbol">{{ top.product.symbol }}</span>
                  <span class="stat-name">{{ top.product.name }}</span>
                </div>
                <span class="stat-isin">{{ top.product.isin }}</span>
                <span class="stat-value">{{ top.count }} clics</span>
              </div>
            </div>
            <div class="stat-card empty" *ngIf="topProducts.length === 0">
              Cliquez sur des produits pour voir le Top 3
            </div>
          </div>
        </header>

        <section class="visualizer">
          <div class="cms-header">
            <h2>Count-Min Sketch Table ({{ cmsRows }}x{{ cmsCols }})</h2>
            <p>Visualisation des hash et incréments en temps réel</p>
          </div>

          <div class="cms-grid">
            <div class="cms-row header-row">
              <div class="row-label">Col.</div>
              <div class="cells">
                <div *ngFor="let c of [].constructor(cmsCols); let i = index" class="column-header">
                  {{ i }}
                </div>
              </div>
            </div>
            <div class="cms-row" *ngFor="let row of cmsTable; let r = index">
              <div class="row-label">Hash {{ r + 1 }}</div>
              <div class="cells">
                <div 
                  *ngFor="let cell of row; let c = index" 
                  class="cms-cell"
                  [class.highlight]="isHighlighted(r, c)"
                  [class.active]="isActive(r, c)"
                >
                  <span class="cell-value">{{ cell }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="legend" *ngIf="lastClickedProduct">
            <div class="info-bubble">
              Dernière action: <strong>{{ lastClickedProduct.name }}</strong> a été haché vers les colonnes 
              <span class="highlight-cols">
                {{ lastHitsDisplay }}
              </span>
            </div>
          </div>
        </section>

        <footer>
          <p>CMSk | Visualisation de l'algorithme Count-Min Sketch avec le CAC40</p>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --bg-dark: #0f172a;
      --sidebar-bg: #1e293b;
      --card-bg: rgba(30, 41, 59, 0.7);
      --text-main: #f8fafc;
      --text-dim: #94a3b8;
      --accent: #10b981;
      --highlight: #f59e0b;
    }

    .app-container {
      display: flex;
      height: 100vh;
      background: var(--bg-dark);
      color: var(--text-main);
      overflow: hidden;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 320px;
      background: var(--sidebar-bg);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .logo {
      padding: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .logo h1 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.025em;
    }

    .logo h1 span { color: var(--primary); }

    .logo p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--text-dim);
    }

    .search-box {
      padding: 1.25rem;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      color: white;
      outline: none;
      transition: all 0.2s;
    }

    .search-box input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .product-list {
      flex: 1;
      overflow-y: auto;
      padding: 0 1.25rem 1.25rem;
    }

    .product-item {
      padding: 1rem;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      margin-bottom: 0.5rem;
    }

    .product-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .product-item.active {
      background: rgba(99, 102, 241, 0.1);
      border-color: rgba(99, 102, 241, 0.3);
    }

    .product-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .product-symbol {
      font-weight: 700;
      color: var(--primary);
    }

    .product-name {
      font-size: 0.9375rem;
      font-weight: 500;
    }

    .product-isin {
      font-size: 0.75rem;
      color: var(--text-dim);
      font-family: monospace;
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding: 2rem;
      gap: 2rem;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .stat-card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      padding: 1.5rem;
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: fadeIn 0.5s ease-out;
    }

    .stat-card.empty {
      grid-column: span 3;
      justify-content: center;
      color: var(--text-dim);
      font-style: italic;
    }

    .stat-rank {
      font-size: 2rem;
      font-weight: 900;
      opacity: 0.2;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stat-name {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .stat-isin {
      font-size: 0.75rem;
      color: var(--text-dim);
      font-family: monospace;
    }

    .stat-symbol {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
    }

    .stat-value {
      font-size: 0.875rem;
      color: var(--text-dim);
    }

    /* Visualizer Styles */
    .visualizer {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      padding: 2rem;
      border-radius: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .cms-header h2 { margin: 0; font-size: 1.25rem; }
    .cms-header p { margin: 0.5rem 0 0; color: var(--text-dim); font-size: 0.875rem; }

    .cms-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow-x: auto;
    }

    .cms-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .row-label {
      width: 80px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-dim);
      text-transform: uppercase;
      text-align: right;
    }

    .column-header {
      width: 50px;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary);
      opacity: 0.8;
    }

    .header-row {
      margin-bottom: 0.25rem;
    }

    .cells {
      display: flex;
      gap: 0.5rem;
    }

    .cms-cell {
      width: 50px;
      height: 50px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .cms-cell.active {
      background: var(--primary);
      border-color: white;
      transform: scale(1.1);
      z-index: 10;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    }

    .cms-cell.highlight {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.2);
    }

    .cell-value {
      pointer-events: none;
    }

    .legend {
      margin-top: auto;
    }

    .info-bubble {
      background: rgba(99, 102, 241, 0.1);
      padding: 1rem;
      border-radius: 0.75rem;
      border-left: 4px solid var(--primary);
      font-size: 0.875rem;
    }

    .highlight-cols {
      color: var(--highlight);
      font-weight: bold;
    }

    footer {
      text-align: center;
      color: var(--text-dim);
      font-size: 0.75rem;
      margin-top: auto;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class App implements OnInit {
  products: Product[] = CAC40_PRODUCTS;
  filteredProducts: Product[] = CAC40_PRODUCTS;

  cmsRows = 4;
  cmsCols = 12;
  cms = new CountMinSketch(this.cmsRows, this.cmsCols);
  cmsTable: number[][] = [];

  realCounts = new Map<string, number>();
  topProducts: { product: Product, count: number }[] = [];

  lastClickedProduct: Product | null = null;
  lastHits: { row: number, col: number }[] = [];
  activeHits: { row: number, col: number }[] = [];

  ngOnInit() {
    this.refreshTable();
  }

  filterProducts(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.symbol.toLowerCase().includes(query) ||
      p.isin.toLowerCase().includes(query)
    );
  }

  incrementProduct(product: Product) {
    this.lastClickedProduct = product;

    // Increment in CMS
    const hits = this.cms.increment(product.isin);
    this.lastHits = hits;
    this.activeHits = hits;

    // Update real counts for Top 3
    const currentCount = (this.realCounts.get(product.isin) || 0) + 1;
    this.realCounts.set(product.isin, currentCount);

    this.updateTop3();
    this.refreshTable();

    // Remove active state after animation
    setTimeout(() => {
      this.activeHits = [];
    }, 500);
  }

  updateTop3() {
    const sorted = [...this.realCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([isin, count]) => ({
        product: this.products.find(p => p.isin === isin)!,
        count
      }));
    this.topProducts = sorted;
  }

  refreshTable() {
    this.cmsTable = this.cms.getTable();
  }

  isHighlighted(row: number, col: number): boolean {
    return this.lastHits.some(h => h.row === row && h.col === col);
  }

  isActive(row: number, col: number): boolean {
    return this.activeHits.some(h => h.row === row && h.col === col);
  }

  get lastHitsDisplay(): string {
    return this.lastHits.map(h => h.col).join(', ');
  }
}
