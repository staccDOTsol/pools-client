import React, {
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from 'react';

import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import { Children } from '~/types/general';
import {
    PoolInfo,
    PoolType,
} from '~/types/pools';
import {
    getMarketInfoFromSymbol,
    getMarketSymbol,
} from '~/utils/poolNames';

import {
    BalanceTypeEnum,
    CommitActionEnum,
    SideEnum,
} from '@tracer-protocol/pools-js';

import { usePools } from '../hooks/usePools';

interface ContextProps {
    swapState: SwapState;
    swapDispatch: React.Dispatch<SwapAction>;
}

// the key here is the leverage amount
// this allows access through Markets[selectedMarket][selectedLeverage]
export type Market = Record<string, PoolInfo>[];

export type SwapState = {
    amount: string;
    invalidAmount: {
        message?: string;
        isInvalid: boolean;
    };
    commitAction: CommitActionEnum;

    // address of selected pool
    selectedPool: string | undefined;

    leverage: number;

    side: SideEnum;

    balanceType: BalanceTypeEnum;

    // selected market name
    market: string;
    markets: Record<string, Market>;
};

export type SwapAction =
    | { type: 'setAmount'; value: string }
    | { type: 'setCommitAction'; value: CommitActionEnum }
    | { type: 'setBalanceType'; value: BalanceTypeEnum }
    | { type: 'setMarket'; value: string }
    | { type: 'setPoolFromMarket'; market: string }
    | { type: 'setMarkets'; markets: Record<string, Market> }
    | { type: 'setLeverage'; value: number }
    | { type: 'setPoolFromLeverage'; value: number }
    | { type: 'setSelectedPool'; value: string }
    | { type: 'setPoolOptions'; options: PoolType[] }
    | { type: 'setInvalidAmount'; value: { message?: string; isInvalid: boolean } }
    | { type: 'setSide'; value: SideEnum }
    | { type: 'reset' };

export const SIDE_OPTIONS = [
    {
        key: SideEnum.long,
        text: 'Long',
    },
    {
        key: SideEnum.short,
        text: 'Short',
    },
];

export const swapDefaults: SwapState = {
    amount: '',
    invalidAmount: {
        message: undefined,
        isInvalid: false,
    },
    commitAction: CommitActionEnum.mint,
    balanceType: BalanceTypeEnum.wallet,
    selectedPool: undefined,
    side: NaN,
    leverage: NaN,
    market: '',
    markets: {},
};

export const SwapContext = React.createContext<Partial<ContextProps>>({});

/**
 * Wrapper store for the swap page state
 */
export const SwapStore: React.FC<Children> = ({ children }: Children) => {
    const router = useRouter();
    const { pools, poolsInitialized } = usePools();
    const initialState: SwapState = swapDefaults;

    const reducer = (state: SwapState, action: SwapAction) => {
        let pool, leverage, side;
        switch (action.type) {
            case 'setAmount':
                return {
                    ...state,
                    amount: action.value,
                };
            case 'setCommitAction':
                return { ...state, commitAction: action.value };
            case 'setBalanceType':
                return { ...state, balanceType: action.value };
            case 'setSide':
                return { ...state, side: action.value };
            case 'setPoolFromLeverage':
                pool = state.markets?.[state.market]?.[action.value][0]?.poolInstance.address;
                console.debug(`Setting pool from leverage: ${pool?.slice()}`);
                return {
                    ...state,
                    selectedPool: pool,
                };
            case 'setLeverage':
                console.debug(`Setting leverage: ${action.value}`);
                return {
                    ...state,
                    leverage: action.value,
                };
            case 'setSelectedPool':
                return { ...state, selectedPool: action.value };
            case 'setInvalidAmount':
                return { ...state, invalidAmount: action.value };
            case 'setMarket':
                leverage = 10000;
                return {
                    ...state,
                    market: action.value,
                    // set leverage if its not already
                    leverage: leverage,
                };
            case 'setPoolFromMarket':
                console.debug(`Setting market: ${action.market}`);
                // set leverage if its not already
                leverage = 10000;
                // set the side to long if its not already
                side = !Number.isNaN(state.side) ? state.side : SideEnum.long;

                // ensure the leverage we are using exists for this market
                // if not, fall back to the first available leverage amount
                if (!state.markets?.[action.market]?.[leverage]?.length) {
                    const firstAvailableLeverage = 10000;
                    leverage = Number(firstAvailableLeverage || 10000);
                }

                pool = state.markets?.[action.market]?.[leverage]?.[0]?.poolInstance?.address;
                if (!pool) {
                    console.error(`Pool not found for market: ${action.market}`);
                    return state;
                }
                console.log(`Setting pool: ${pool?.slice()}`);
                return {
                    ...state,
                    market: action.market,
                    selectedPool: pool,
                    leverage: leverage,
                    side: side,
                };
            case 'setMarkets':
                return {
                    ...state,
                    markets: action.markets,
                };
            case 'reset':
                return {
                    ...swapDefaults,
                    commitAction: state.commitAction,
                };
            default:
                throw new Error('Unexpected action');
        }
    };

    const [swapState, swapDispatch] = useReducer(reducer, initialState);

    // handles the setting of routed values
    useEffect(() => {
        if (swapDispatch) {
            if (router.query.pool) {
                swapDispatch({ type: 'setSelectedPool', value: router.query.pool as string });
            }
            if (router.query.type) {
                swapDispatch({
                    type: 'setCommitAction',
                    value: parseInt(router.query.type as string) as CommitActionEnum,
                });
            }
            if (router.query.side) {
                swapDispatch({ type: 'setSide', value: parseInt(router.query.side as string) as SideEnum });
            }
        }
    }, [router]);

    // sets the markets after the pools have been initialised
    useMemo(() => {
        if (poolsInitialized && Object.keys(pools)?.length) {
            const markets: Record<string, Market> = {};
            Object.values(pools).forEach((pool) => {
                const { leverage, marketSymbol } = getMarketInfoFromSymbol(pool.poolInstance.name);
                // hopefully valid pool name
                if (marketSymbol) {
                    if (!markets[marketSymbol]) {
                        markets[marketSymbol] = {} as Record<string, PoolInfo>[];
                    }
                    // markets[marketSymbol][leverage] = pool.poolInstance;
                    markets[marketSymbol][leverage] = markets[marketSymbol][leverage] || [];
                    (markets[marketSymbol][leverage] as unknown as PoolInfo[]).push(pool);
                }
            });
            swapDispatch({
                type: 'setMarkets',
                markets,
            });
        }
    }, [poolsInitialized, pools]);

    // sets the market after pools have been initialised and the route set
    useEffect(() => {
        if (poolsInitialized && router.query.pool) {
            // the selectedPool will already be set from the above useEffect
            if (pools[router.query.pool as string]) {
                const { leverage, name } = pools[router.query.pool as string].poolInstance;
                swapDispatch({
                    type: 'setMarket',
                    // eg 3-BTC/USD -> BTC/USD
                    value: getMarketSymbol(name),
                });
                swapDispatch({
                    type: 'setLeverage',
                    value: leverage,
                });
            }
        }
    }, [poolsInitialized, router]);

    return (
        <SwapContext.Provider
            value={{
                swapState,
                swapDispatch,
            }}
        >
            {children}
        </SwapContext.Provider>
    );
};

export const noDispatch: any = () => console.error('Swap dispatch undefined');

export const useSwapContext: () => Partial<ContextProps> = () => {
    const context = useContext(SwapContext);
    if (context === undefined) {
        throw new Error(`useSwapContext must be called within SwapContext`);
    }
    return context;
};

export const useBigNumber: (num: string) => BigNumber = (num) =>
    useMemo(() => (!!num ? new BigNumber(num) : new BigNumber(0)), [num]);
