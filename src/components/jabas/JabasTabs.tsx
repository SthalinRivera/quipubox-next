'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/tabs/Tabs';
import JabasPorPagarTable from './JabasPorPagarTable';
import JabasPorCobrarTable from './JabasPorCobrarTable';
import { JabaPorCobrar } from '@/types/jaba';

export default function JabasTabs() {
    const [activeTab, setActiveTab] = useState('pagar');

    const tabs = [
        { id: 'pagar', label: 'Por Pagar (Emisor)' },
        { id: 'cobrar', label: 'Por Cobrar (Receptor)' },
    ];

    return (
        <div className="space-y-4">
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
            />
            <div className="mt-4">
                {activeTab === 'pagar' && <JabasPorPagarTable />}
                {activeTab === 'cobrar' && <JabasPorCobrarTable onRegisterRecuperacion={function (jaba: JabaPorCobrar): void {
                    throw new Error('Function not implemented.');
                }} />}
            </div>
        </div>
    );
}