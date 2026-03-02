import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, CAC40_PRODUCTS } from '../../data/cac40.data';
import { CountMinSketch } from '../../models/cmsk.model';

@Component({
    selector: 'app-cmsk-ui',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cmsk-ui.component.html',
    styleUrl: './cmsk-ui.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CmskUiComponent implements OnInit {
    products: Product[] = CAC40_PRODUCTS;
    filteredProducts: Product[] = CAC40_PRODUCTS;

    cmsRows = 4;
    cmsCols = 32; // nb premier ou puissance de deux 
    cms = new CountMinSketch(this.cmsRows, this.cmsCols);
    cmsTable: number[][] = [];

    realCounts = new Map<string, number>();
    topProducts: { product: Product, count: number }[] = [];
    topEstimatedProducts: { product: Product, score: number }[] = [];

    lastClickedProduct: Product | null = null;
    lastHits: { row: number, col: number }[] = [];
    activeHits: { row: number, col: number }[] = [];

    showDeltaInfo = false;
    showEpsilonInfo = false;

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
        this.internalIncrement(product, true);
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

    updateEstimatedTop3(currentProduct: Product) {
        const score = this.cms.estimate(currentProduct.isin);

        // Check if the product is already in the top estimated list
        const index = this.topEstimatedProducts.findIndex(p => p.product.isin === currentProduct.isin);

        if (index !== -1) {
            // Update existing entry
            this.topEstimatedProducts[index].score = score;
        } else if (this.topEstimatedProducts.length < 3) {
            // Add if there's room
            this.topEstimatedProducts.push({ product: currentProduct, score });
        } else {
            // Check if it should replace the lowest score in top 3
            const minScoreItem = [...this.topEstimatedProducts].sort((a, b) => a.score - b.score)[0];
            if (score > minScoreItem.score) {
                const minIndex = this.topEstimatedProducts.indexOf(minScoreItem);
                this.topEstimatedProducts[minIndex] = { product: currentProduct, score };
            }
        }

        // Sort the list
        this.topEstimatedProducts.sort((a, b) => b.score - a.score);
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

    get lastEstimatedScore(): number {
        return this.lastClickedProduct ? this.cms.estimate(this.lastClickedProduct.isin) : 0;
    }

    get lastRealCount(): number {
        return this.lastClickedProduct ? (this.realCounts.get(this.lastClickedProduct.isin) || 0) : 0;
    }

    runSimulation(iterations: number) {
        this.lastClickedProduct = null;
        this.lastHits = [];
        this.activeHits = [];

        for (let i = 0; i < iterations; i++) {
            const randomProduct = this.products[Math.floor(Math.random() * this.products.length)];
            this.internalIncrement(randomProduct, false);
        }

        this.updateTop3();
        // For the estimated top 3, we need to refresh based on actual CMS state for all products
        // because we don't have a single "currentProduct" for the whole simulation.
        this.refreshEstimatedTop3();
        this.refreshTable();
    }

    private internalIncrement(product: Product, updateUI: boolean) {
        // Increment in CMS
        const hits = this.cms.increment(product.isin);

        if (updateUI) {
            this.lastHits = hits;
            this.activeHits = hits;
        }

        // Update real counts
        const currentCount = (this.realCounts.get(product.isin) || 0) + 1;
        this.realCounts.set(product.isin, currentCount);

        if (updateUI) {
            this.updateTop3();
            this.updateEstimatedTop3(product);
            this.refreshTable();

            setTimeout(() => {
                this.activeHits = [];
            }, 500);
        }
    }

    private refreshEstimatedTop3() {
        const scores = this.products.map(p => ({
            product: p,
            score: this.cms.estimate(p.isin)
        }));

        this.topEstimatedProducts = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }

    updateRows(event: Event) {
        const value = parseInt((event.target as HTMLInputElement).value, 10);
        if (value >= 3 && value <= 7) {
            this.cmsRows = value;
            this.resetCms();
        }
    }

    updateCols(event: Event) {
        const value = parseInt((event.target as HTMLInputElement).value, 10);
        if (value >= 16 && value <= 256) {
            this.cmsCols = value;
            this.resetCms();
        }
    }

    private resetCms() {
        this.cms = new CountMinSketch(this.cmsRows, this.cmsCols);
        this.realCounts.clear();
        this.topProducts = [];
        this.topEstimatedProducts = [];
        this.lastClickedProduct = null;
        this.lastHits = [];
        this.activeHits = [];
        this.refreshTable();
    }

    toggleDeltaInfo() {
        this.showDeltaInfo = !this.showDeltaInfo;
    }

    get delta(): number {
        // k = ln(1/delta) => 1/delta = e^k => delta = e^-k
        return Math.exp(-this.cmsRows);
    }

    get confidence(): number {
        return (1 - this.delta) * 100;
    }

    toggleEpsilonInfo() {
        this.showEpsilonInfo = !this.showEpsilonInfo;
    }

    get totalClicks(): number {
        return Array.from(this.realCounts.values()).reduce((sum, count) => sum + count, 0);
    }

    get epsilon(): number {
        // epsilon = e / w
        return 2.718 / this.cmsCols;
    }

    get maxErrorClicks(): number {
        return this.epsilon * this.totalClicks;
    }
}
