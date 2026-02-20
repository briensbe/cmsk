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
            // Note: In OnPush, we might need markForCheck if this was asynchronous outside of NgZone,
            // but here we are in Angular event handlers.
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
