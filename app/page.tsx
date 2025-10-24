'use client';

import { useState, useEffect, useMemo } from 'react';

// --- ICON COMPONENTS ---
const SunIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.706-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
    </svg>
);

const MoonIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
);

interface Country {
    name: {
        common: string;
        official: string;
    };
    capital?: string[];
    region: string;
    population: number;
    flags: {
        png: string;
        svg: string;
    };
    cca3: string;
}

export default function Home() {
    const [allCountries, setAllCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentTheme, setTheme] = useState('light');
    const [currentFilter, setFilter] = useState('all');
    const [currentSort, setSort] = useState('name-asc');
    const [currentSearch, setSearch] = useState('');

    // Fetch countries on mount
    useEffect(() => {
        const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
        const systemPrefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
        setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

        const fetchCountries = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,population,region,capital,flags,cca3');
                if (!response.ok) throw new Error('Failed to fetch country data');
                const data = await response.json();
                setAllCountries(data);
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, []);

    // Apply theme
    useEffect(() => {
        if (currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', currentTheme);
        }
    }, [currentTheme]);

    // Get unique regions
    const regions = useMemo(() => {
        const regionSet = new Set(allCountries.map(c => c.region));
        return [...regionSet].filter(Boolean).sort();
    }, [allCountries]);

    // Filter and sort countries
    const visibleCountries = useMemo(() => {
        let filtered = [...allCountries];

        if (currentFilter !== 'all') {
            filtered = filtered.filter(c => c.region === currentFilter);
        }

        const searchTerm = currentSearch.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(c => {
                const name = c.name.common.toLowerCase();
                const capital = c.capital?.[0]?.toLowerCase() || '';
                return name.includes(searchTerm) || capital.includes(searchTerm);
            });
        }

        filtered.sort((a, b) => {
            switch (currentSort) {
                case 'name-asc':
                    return a.name.common.localeCompare(b.name.common);
                case 'name-desc':
                    return b.name.common.localeCompare(a.name.common);
                case 'pop-desc':
                    return b.population - a.population;
                case 'pop-asc':
                    return a.population - b.population;
                default:
                    return a.name.common.localeCompare(b.name.common);
            }
        });

        return filtered;
    }, [allCountries, currentFilter, currentSearch, currentSort]);

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
                <nav className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Countries of the World</h1>
                    
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        {/* Search */}
                        <input
                            type="search"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search by name or capital..."
                            value={currentSearch}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        
                        {/* Region Filter */}
                        <select
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={currentFilter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Regions</option>
                            {regions.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={currentSort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="pop-desc">Population (High-Low)</option>
                            <option value="pop-asc">Population (Low-High)</option>
                        </select>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Toggle theme"
                        >
                            {currentTheme === 'light' ? <SunIcon /> : <MoonIcon />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4 md:p-8">
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-4 text-lg font-medium">Loading countries...</span>
                    </div>
                )}
                
                {error && (
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                        >
                            Reload Page
                        </button>
                    </div>
                )}
                
                {!loading && !error && visibleCountries.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {visibleCountries.map(country => (
                            <div
                                key={country.cca3}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
                            >
                                <img 
                                    src={country.flags.svg || country.flags.png}
                                    alt={`Flag of ${country.name.common}`}
                                    className="w-full h-40 object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://via.placeholder.com/400x300?text=No+Flag';
                                    }}
                                />
                                <div className="p-5">
                                    <h2 className="text-xl font-bold mb-2 truncate" title={country.name.common}>
                                        {country.name.common}
                                    </h2>
                                    <p className="text-sm mb-1">
                                        <strong>Population:</strong> {country.population.toLocaleString()}
                                    </p>
                                    <p className="text-sm mb-1">
                                        <strong>Region:</strong> {country.region}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Capital:</strong> {country.capital?.[0] || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && visibleCountries.length === 0 && (
                    <div className="text-center mt-10">
                        <h2 className="text-2xl font-semibold">No Countries Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Try adjusting your filter settings.</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center p-6 mt-10 text-gray-500 dark:text-gray-400 text-sm">
                <p>Powered by REST Countries API</p>
            </footer>
        </div>
    );
}