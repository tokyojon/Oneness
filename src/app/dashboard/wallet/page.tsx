'use client';

import { WKPWalletComponent } from "@/components/wallet/wkp-wallet";

export default function WalletPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">WKP ウォレット</h1>
                <p className="text-muted-foreground mt-1">
                    あなたのOneness Kingdom Pointsを管理しましょう
                </p>
            </div>
            
            <WKPWalletComponent />
        </div>
    );
}
