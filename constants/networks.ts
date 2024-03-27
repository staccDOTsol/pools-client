import { Network } from '~/types/networks';

import { KnownNetwork } from '@tracer-protocol/pools-js';
import { NETWORKS } from '@tracer-protocol/pools-js/utils/constants';

export const UNKNOWN_NETWORK = '0';


/**
 * Network store which allows swapping between networks and fetching from different data sources.
 * Keys are the ID of the network.
 */
export const networkConfig: Record<KnownNetwork, Network> = {
    [NETWORKS.ARBITRUM_RINKEBY]: {
        id: NETWORKS.ARBITRUM_RINKEBY,
        name: 'Rinkeby',
        logoTicker: NETWORKS.ARBITRUM,
        previewUrl: 'https://testnet.arbiscan.io',
        hex: '0x66EEB',
        publicRPC: process.env.NEXT_PUBLIC_TESTNET_RPC ?? 'https://rinkeby.arbitrum.io/rpc',
        publicWebsocketRPC: process.env.NEXT_PUBLIC_TESTNET_WSS_RPC,
        usdcAddress: '',
        tcrAddress: '',
        knownMarketSpotPriceChainlinkFeeds: {
            'BTC/USD': {
                feedAddress: '0x0c9973e7a27d00e656B9f153348dA46CaD70d03d',
                decimals: 8,
            },
            'ETH/USD': {
                feedAddress: '0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8',
                decimals: 8,
            },
        },
    },
    [NETWORKS.ARBITRUM]: {
        id: NETWORKS.ARBITRUM,
        name: 'Arbitrum',
        logoTicker: NETWORKS.ARBITRUM,
        previewUrl: 'https://arbiscan.io/',
        hex: '0xA4B1',
        publicRPC: "https://arb-mainnet.g.alchemy.com/v2/KebS3a1XP3rzFHvzpsokZZHbqHQjmF_e" ?? 'https://arb1.arbitrum.io/rpc',
        publicWebsocketRPC: "wss://arb-mainnet.g.alchemy.com/v2/KebS3a1XP3rzFHvzpsokZZHbqHQjmF_e",
        usdcAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        tcrAddress: '0x1C5884AB83729f47Cd2d2c383d5C433456AEad8E',
        knownMarketSpotPriceChainlinkFeeds: {
            'BTC/USD': {
                feedAddress: '0x6ce185860a4963106506C203335A2910413708e9',
                decimals: 8,
            },
            'ETH/USD': {
                feedAddress: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
                decimals: 8,
            },
            'WTI/USD': {
                feedAddress: '0x594b919AD828e693B935705c3F816221729E7AE8',
                decimals: 8,
            },
        },
    },
    [NETWORKS.MAINNET]: {
        id: NETWORKS.MAINNET,
        name: 'Ethereum',
        logoTicker: 'ETH',
        previewUrl: '',
        hex: '0x1',
        publicRPC: process.env.NEXT_PUBLIC_MAINNET_L1_RPC || '',
        usdcAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        tcrAddress: '0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050',
    },
    [NETWORKS.RINKEBY]: {
        id: NETWORKS.RINKEBY,
        name: 'Rinkeby',
        logoTicker: 'ETH',
        previewUrl: '',
        hex: '0x4',
        publicRPC: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        usdcAddress: '',
        tcrAddress: '',
    },
    [NETWORKS.KOVAN]: {
        // TODO fill this out properly
        id: NETWORKS.KOVAN,
        name: 'Kovan',
        logoTicker: 'ETH',
        previewUrl: '',
        hex: '0x4',
        publicRPC: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        usdcAddress: '',
        tcrAddress: '',
    },
};

export const DEFAULT_NETWORK = NETWORKS.ARBITRUM;
export const DEFAULT_WSS_RPC = networkConfig[DEFAULT_NETWORK].publicWebsocketRPC;
