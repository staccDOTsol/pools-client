import { SHORT, LONG, MINT, BURN, LONG_BURN, LONG_MINT, SHORT_BURN, SHORT_MINT } from '@libs/constants';
import BigNumber from 'bignumber.js';
import React from 'react';

/**
 * Can be used when component passes down children
 */
export type Children = {
    children?: React.ReactNode;
};

/**
 * Universal result object
 */
export type Result = {
    status: 'error' | 'success';
    message?: string;
    error?: string;
};

export type APIResult = {
    status: 'error' | 'success';
    message: string;
    data: any;
};
export type SideType = typeof LONG | typeof SHORT;

export type TokenType = typeof MINT | typeof BURN;

export type CommitType = typeof SHORT_MINT | typeof SHORT_BURN | typeof LONG_MINT | typeof LONG_BURN;

// TODO change this to known markets
export type MarketType = 'ETH/USDC' | 'ETH/TUSD' | 'BTC/USD' | undefined;

// TODO change this to known currencies
export type CurrencyType = 'DAI' | 'USDC';

export type LeverageType = number;

export type PoolType = {
    name: string;
    address: string;
};

export type Token = {
    address: string;
    name: string;
    balance: BigNumber;
    approved: boolean;
};

export type PoolToken = Token & {
    side: SideType;
    supply: BigNumber;
};

export type Committer = {
    address: string;
    pendingLong: BigNumber;
    pendingShort: BigNumber;
};

export type Pool = {
    address: string;
    name: string;
    updateInterval: BigNumber;
    frontRunningInterval: BigNumber;
    lastUpdate: BigNumber;
    lastPrice: BigNumber;
    shortBalance: BigNumber;
    leverage: BigNumber;
    longBalance: BigNumber;
    oraclePrice: BigNumber;
    quoteToken: Token;
    shortToken: PoolToken;
    longToken: PoolToken;
    committer: Committer;
    subscribed: boolean;
};
