"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Trash2, CheckCircle2, X, Shield } from 'lucide-react';
import { useAppStore, Provider, PROVIDERS } from '@/lib/store';
import { Button } from './ui/Button';

interface ApiKeyManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ApiKeyManager({ isOpen, onClose }: ApiKeyManagerProps) {
    const { apiKeys, activeKeyId, addApiKey, removeApiKey, setActiveKey, t } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyValue, setNewKeyValue] = useState('');
    const [newKeyProvider, setNewKeyProvider] = useState<Provider>('gemini');
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const selectedProviderInfo = PROVIDERS.find(p => p.id === newKeyProvider);

    const handleAddKey = async () => {
        if (!newKeyName.trim() || !newKeyValue.trim()) {
            setError(t('apiKey.name') + ' and ' + t('apiKey.key') + ' are required');
            return;
        }

        if (selectedProviderInfo?.keyPrefix && !newKeyValue.startsWith(selectedProviderInfo.keyPrefix)) {
            setError(`Invalid ${selectedProviderInfo.name} API Key format (should start with ${selectedProviderInfo.keyPrefix})`);
            return;
        }

        setIsValidating(true);
        setError('');

        try {
            if (newKeyProvider === 'openai' && selectedProviderInfo?.validateUrl) {
                const response = await fetch(selectedProviderInfo.validateUrl, {
                    headers: { 'Authorization': `Bearer ${newKeyValue}` },
                });
                if (!response.ok) throw new Error('Invalid API Key');
            } else if (newKeyProvider === 'gemini' && selectedProviderInfo?.validateUrl) {
                const response = await fetch(`${selectedProviderInfo.validateUrl}${newKeyValue}`);
                if (!response.ok) throw new Error('Invalid API Key');
            }

            addApiKey(newKeyName, newKeyValue, newKeyProvider);
            setNewKeyName('');
            setNewKeyValue('');
            setNewKeyProvider('gemini');
            setIsAdding(false);
        } catch {
            setError('Failed to validate API Key. Please check and try again.');
        } finally {
            setIsValidating(false);
        }
    };

    const canClose = apiKeys.length > 0;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-neutral-800 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                                <Key className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">{t('apiKey.title')}</h2>
                                <p className="text-sm text-neutral-500">{t('apiKey.subtitle')}</p>
                            </div>
                        </div>
                        {canClose && (
                            <button
                                onClick={onClose}
                                className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Existing Keys List */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {apiKeys.map((k) => {
                                const providerInfo = PROVIDERS.find(p => p.id === k.provider);
                                const isActive = k.id === activeKeyId;
                                return (
                                    <div
                                        key={k.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${isActive
                                            ? 'border-white bg-neutral-800'
                                            : 'border-neutral-800 hover:border-neutral-700'
                                            }`}
                                        onClick={() => setActiveKey(k.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive
                                                ? 'bg-white text-neutral-900'
                                                : 'bg-neutral-800 text-neutral-500'
                                                }`}>
                                                {isActive ? <CheckCircle2 className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-300'}`}>{k.name}</p>
                                                <p className="text-xs text-neutral-500">
                                                    {providerInfo?.name || k.provider} • {k.key.slice(0, 6)}...{k.key.slice(-4)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeApiKey(k.id); }}
                                            className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}

                            {apiKeys.length === 0 && !isAdding && (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Shield className="w-6 h-6 text-neutral-500" />
                                    </div>
                                    <p className="text-sm text-neutral-400">{t('apiKey.noKeys')}</p>
                                    <p className="text-xs text-neutral-600 mt-1">Add your first API key to start</p>
                                </div>
                            )}
                        </div>

                        {/* Add New Key Form */}
                        <AnimatePresence>
                            {isAdding ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 border-t border-neutral-800 pt-4"
                                >
                                    {/* Provider Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-2">{t('apiKey.provider')}</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {PROVIDERS.map((provider) => (
                                                <button
                                                    key={provider.id}
                                                    type="button"
                                                    onClick={() => setNewKeyProvider(provider.id)}
                                                    className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${newKeyProvider === provider.id
                                                        ? 'border-white bg-neutral-800 text-white'
                                                        : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                                        }`}
                                                >
                                                    {provider.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Key Name Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-2">{t('apiKey.name')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., My Gemini Key"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600"
                                        />
                                    </div>

                                    {/* API Key Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-2">{selectedProviderInfo?.name || 'API'} Key</label>
                                        <input
                                            type="password"
                                            placeholder={selectedProviderInfo?.keyPrefix ? `${selectedProviderInfo.keyPrefix}...` : 'Enter your API key'}
                                            value={newKeyValue}
                                            onChange={(e) => setNewKeyValue(e.target.value)}
                                            className={`w-full h-10 px-3 rounded-lg bg-neutral-800 border text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 ${error
                                                ? 'border-red-500/50 focus:ring-red-500/50'
                                                : 'border-neutral-700 focus:ring-neutral-600 focus:border-neutral-600'
                                                }`}
                                        />
                                        {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={handleAddKey} isLoading={isValidating} className="flex-1">
                                            {t('apiKey.add')}
                                        </Button>
                                        <Button variant="ghost" onClick={() => { setIsAdding(false); setError(''); }}>
                                            {t('common.cancel')}
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setIsAdding(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> {t('apiKey.add')}
                                </Button>
                            )}
                        </AnimatePresence>

                        {canClose && (
                            <Button className="w-full" onClick={onClose}>
                                {t('common.close')}
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
