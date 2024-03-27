import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import styled from 'styled-components';
import ExchangeButtons from '~/archetypes/BuyTokens/ExchangeButtons';
import {
    LeverageSelector,
    MarketDropdown,
    PoolTypeDropdown,
    SideSelector,
} from '~/archetypes/BuyTokens/Inputs';
import MintSummaryModal from '~/archetypes/BuyTokens/MintSummaryModal';
import { isInvalidAmount } from '~/archetypes/Exchange/Inputs';
import AmountInput from '~/archetypes/Exchange/Inputs/AmountInput';
import {
    Logo,
    tokenSymbolToLogoTicker,
} from '~/components/General';
import Button from '~/components/General/Button';
import { Container } from '~/components/General/Container';
import { MarketTypeTip } from '~/components/Tooltips';
import { CommitActionSideMap } from '~/constants/commits';
import {
    noDispatch,
    SwapContext,
    swapDefaults,
    useBigNumber,
} from '~/context/SwapContext';
import useBrowsePools from '~/hooks/useBrowsePools';
import { usePool } from '~/hooks/usePool';
import usePoolsNextBalances from '~/hooks/usePoolsNextBalances';
import InfoIcon from '~/public/img/general/info.svg';
import { useStore } from '~/store/main';
import {
    selectImportedPools,
    selectImportPool,
} from '~/store/PoolsSlice';
import { Theme } from '~/store/ThemeSlice/themes';
import {
    selectAccount,
    selectHandleConnect,
    selectNetwork,
} from '~/store/Web3Slice';
import { PoolInfo } from '~/types/pools';
import { saveImportedPoolsToLocalStorage } from '~/utils/pools';

import {
    BalanceTypeEnum,
    KnownNetwork,
    SideEnum,
} from '@tracer-protocol/pools-js';

const BuyTokens: React.FC = () => {
    const [isSummaryOpen, setSummaryOpen] = useState(false);
    const { swapState = swapDefaults, swapDispatch = noDispatch } = useContext(SwapContext);
    const { amount, leverage, market, markets, selectedPool, side, commitAction, balanceType, invalidAmount } =
        swapState || {};
    const { rows: poolTokens } = useBrowsePools();

    const account = useStore(selectAccount);
    const handleConnect = useStore(selectHandleConnect);

    const amountBN = useBigNumber(amount);
    const isLong = side === SideEnum.long;
    const commitType = CommitActionSideMap[commitAction][side];

    const { poolInstance: pool, userBalances } = usePool(selectedPool);

    const token = useMemo(() => (isLong ? pool.longToken : pool.shortToken), [isLong, pool.longToken, pool.shortToken]);
    const tokenBalance = useMemo(() => {
        switch (balanceType) {
            case BalanceTypeEnum.escrow:
                return isLong ? userBalances.aggregateBalances.longTokens : userBalances.aggregateBalances.shortTokens;
            default:
                return isLong ? userBalances.longToken.balance : userBalances.shortToken.balance;
        }
    }, [
        isLong,
        balanceType,
        userBalances.longToken,
        userBalances.shortToken,
        userBalances.aggregateBalances.longTokens,
        userBalances.aggregateBalances.shortTokens,
    ]);

    const settlementTokenBalance = useMemo(() => {
        switch (balanceType) {
            case BalanceTypeEnum.escrow:
                return userBalances.aggregateBalances.settlementTokens;
            default:
                return userBalances.settlementToken.balance;
        }
    }, [balanceType, userBalances.settlementToken, userBalances.aggregateBalances.settlementTokens]);

    const nextBalances = usePoolsNextBalances(pool);
    const notional = useMemo(() => (isLong ? nextBalances.nextLongBalance : nextBalances.nextShortBalance), [isLong]);

    const pendingBurns = useMemo(
        () => (isLong ? pool.committer.pendingLong.burn : pool.committer.pendingShort.burn),
        [isLong, pool.committer.pendingLong.burn, pool.committer.pendingShort.burn],
    );

    useEffect(() => {
        if (pool) {
            const invalidAmount = isInvalidAmount(amountBN, settlementTokenBalance);

            swapDispatch({
                type: 'setInvalidAmount',
                value: invalidAmount,
            });
        }
    }, [commitAction, amount, notional, token, pendingBurns, settlementTokenBalance, tokenBalance]);

    const buyTableData = useMemo(
        () => [
            {
                name: 'Market',
                selector: <MarketDropdown market={market} markets={markets} swapDispatch={swapDispatch} />,
            },
            {
                name: 'Side',
                selector: <SideSelector side={side} swapDispatch={swapDispatch} />,
            },
            {
                name: 'Leverage',
                selector: (
                    <LeverageSelector
                        market={market}
                        markets={markets}
                        leverage={leverage}
                        swapDispatch={swapDispatch}
                    />
                ),
            },
            {
                name: 'Market type',
                TooltipEl: MarketTypeTip,
                selector: (
                    <PoolTypeDropdown
                        market={market}
                        markets={markets}
                        leverage={leverage}
                        swapDispatch={swapDispatch}
                        selectedPool={selectedPool}
                    />
                ),
            },
            {
                name: 'Token to spend',
                selector: (
                    <AmountInput
                        invalidAmount={invalidAmount}
                        amount={amount}
                        amountBN={amountBN}
                        balance={settlementTokenBalance}
                        tokenSymbol={pool.settlementToken.symbol}
                        swapDispatch={swapDispatch}
                        selectedPool={selectedPool}
                        isPoolToken={false}
                        decimalPlaces={pool.settlementToken.decimals}
                    />
                ),
            },
            {
                name: '',
                selector: (
                    <ArrowContainer>
                        <ArrowImg src="/img/general/arrow-down.svg" alt="Arrow down" />
                        <ArrowImg src="/img/general/arrow-down.svg" alt="Arrow down" />
                        <ArrowImg src="/img/general/arrow-down.svg" alt="Arrow down" />
                    </ArrowContainer>
                ),
            },
            {
                name: 'Token to receive',
                selector: (
                    <TokenReceiveBox>
                        <Logo className="mr-2 inline" size="md" ticker={tokenSymbolToLogoTicker(token?.symbol)} />
                        {token?.symbol}
                    </TokenReceiveBox>
                ),
            },
        ],
        [
            account,
            market,
            markets,
            leverage,
            tokenBalance,
            swapDispatch,
            invalidAmount,
            amount,
            amountBN,
            side,
            pool,
            settlementTokenBalance,
            selectedPool,
        ],
    );

    const handleModalOpen = () => {
        setSummaryOpen(true);
    };

    const handleModalClose = () => {
        setSummaryOpen(false);
    };
    let importing = ["0x201aC16099DEcD07b0ab3D4c55895A0E7F3591ED", 
    "0xe0B0350db35C1c0671a69AD7f115c0B480A27af6",
    "0x938E8ae2f6c78EfcbFd5353637134Bcd4F972B28",
    "0x9eBe7A07fCa6413257885B11aE9E5365E32E034C",
    "0x99B8449C27Cfc185DacDec5C14Cb6312516ab7A1",
    "0x8b5838f3a3A3e0C20e728C7ce3496a1b5F6668B9",
    "0x887B7BE8A37B2c9D40627a8236Cb09a4eEf9b01b",
    "0x21ed6D10428576845C79ee4198DE4295f3FC8Cce",
"0x6fE1d1eD7E28b438B9f1537EbE895ec3bf86445e",
"0xC4D43534c3DaefF5130f563Bd238945E89a506A9",
"0x42042C703b22645749A48aFE1C57c06057090DB8",
"0xF63AeD8Cee14CDBf2E598a8c8bd14F009B4f5046",
"0x2f5607f71b0F6178B10F6966B8fe8BAD354D1662",
"0x5E0d14e1E8395F14BaABfa6a8c5b7Faf019af4aF"
    ] 
    const imported: any [] = []
    const importPool = useStore(selectImportPool);
    const network = useStore(selectNetwork);
    const importedPools = useStore(selectImportedPools);
    useEffect(() => {
        async function importPools(){
        let done = false 
        while (!done){
            try {
const userInput = importing[Math.floor(Math.random() * importing.length)]
        importing = importing.filter((v) => v !== userInput)
        let dont = false
            for (const imported of importedPools){
                if (imported.address === userInput){
                    dont = true
                }
            }
            if (!dont){
                await new Promise((resolve) => setTimeout(resolve, Math.random()* 3000 + 1000))
                importPool(network as KnownNetwork, userInput);
                saveImportedPoolsToLocalStorage(network as KnownNetwork, [userInput]);
console.log(importedPools.length)
            } else {
                
            }
            imported.push(userInput)
            done = true 
        }
         catch (err){
            await new Promise((resolve) => setTimeout(resolve, 1000))
         }
        }
    }
    importPools()
    

            
}, [importedPools]);
    return (
        <>
            <Container>
                <FormBackdrop>
                    <Header>
                        <H1>Get Leveraged Tokens</H1>
                    </Header>
                    <Divider />
                    <Table>
                        <tbody>
                            {/* Only show 'token to receive' and arrow row after user selection */}
                            {/* Only show Market type row for markets that have multiple pools that match user selection */}
                            {buyTableData.map((v, i) => {
                                if (
                                    ((v.name === 'Token to receive' || v.name === '') && token && token.symbol) ||
                                    (v.name === 'Market type' &&
                                        market &&
                                        markets &&
                                        leverage &&
                                        (markets?.[market]?.[leverage] as unknown as PoolInfo[])?.length > 1) ||
                                    (v.name !== 'Token to receive' && v.name !== '' && v.name !== 'Market type')
                                ) {
                                    return (
                                        <TableRow key={`${v.name}-${i}`}>
                                            <TableCellLeft>
                                                {v.name}{' '}
                                                {v.TooltipEl && (
                                                    <v.TooltipEl>
                                                        <StyledInfoIcon />
                                                    </v.TooltipEl>
                                                )}
                                            </TableCellLeft>
                                            <TableCellRight
                                                noPadding={
                                                    (!!token && v.name === '') ||
                                                    (!!token && !!token.symbol && v.name === 'Token to spend')
                                                }
                                            >
                                                {v.selector}
                                            </TableCellRight>
                                        </TableRow>
                                    );
                                }
                            })}
                        </tbody>
                    </Table>
                    {account && poolTokens.length && token && token.symbol ? (
                        <ExchangeButtons
                            account={account}
                            amount={amount}
                            pool={pool}
                            token={token}
                            isLong={isLong}
                            side={side}
                            leverage={leverage}
                            market={market}
                            poolTokens={poolTokens}
                            swapState={swapState}
                            swapDispatch={swapDispatch}
                            userBalances={userBalances}
                            amountBN={amountBN}
                            commitType={commitType}
                            isInvalid={invalidAmount.isInvalid}
                            onButtonClick={handleModalOpen}
                        />
                    ) : null}
                    {!account && (
                        <ConnectButtonStyled
                            size="lg"
                            variant="primary"
                            onClick={(_e) => {
                                handleConnect();
                            }}
                        >
                            Connect Wallet
                        </ConnectButtonStyled>
                    )}
                </FormBackdrop>
            </Container>
            <MintSummaryModal
                isOpen={true}
                amount={amount}
                selectedPool={selectedPool}
                side={side}
                invalidAmount={invalidAmount}
                commitType={commitType}
                commitAction={commitAction}
                swapState={swapState}
                swapDispatch={swapDispatch}
                userBalances={userBalances}
                token={token}
                isLong={isLong}
                onClose={handleModalClose}
                isSummaryOpen={isSummaryOpen}
            />
        </>
    );
};

export default BuyTokens;

const FormBackdrop = styled.section`
    background: var(--background);
    border-radius: 20px;
    box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    font-family: 'Inter';
    padding: 16px;
    margin: 16px auto 32px;
    @media (min-width: 640px) {
        padding: 48px 48px 16px;
        margin: 63px auto 150px;
        max-width: 690px;
    }
`;

const Header = styled.header`
    margin-bottom: 16px;
`;

const H1 = styled.h1`
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 150%;
    color: var(--text);
`;

const Divider = styled.hr`
    border-top: 1px solid var(--border);
    margin-bottom: 32px;
`;

const Table = styled.table`
    width: 100%;
`;

const TableRow = styled.tr`
    display: flex;
    flex-direction: column;
    @media (min-width: 640px) {
        display: table-row;
    }
`;

const TableCellLeft = styled.td<{ noPadding?: boolean }>`
    display: flex;
    align-items: center;
    padding-top: 16px;
    min-width: 160px;
    height: 100%;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: var(--text);
`;

const TableCellRight = styled.td<{ noPadding?: boolean }>`
    width: 100%;
    padding-bottom: ${({ noPadding }) => (noPadding ? '0' : '10px')};
    @media (min-width: 640px) {
        padding-bottom: ${({ noPadding }) => (noPadding ? '0' : '38px')};
    }
`;

const ArrowContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 0;
`;

const ArrowImg = styled.img`
    height: 33px;
    width: 24px;
    margin-right: 40px;
    &:last-of-type {
        margin-right: 0px;
    }
`;

const TokenReceiveBox = styled.div`
    width: 100%;
    height: 55px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 20px;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: 7px;
    margin-bottom: 20px;
    user-select: none;
    @media (min-width: 640px) {
        margin-bottom: 0px;
        padding-bottom: 0px;
    }
`;

const ConnectButtonStyled = styled(Button)`
    text-transform: capitalize;
    z-index: 0;
    margin-bottom: 16px;
    @media (min-width: 640px) {
        margin-bottom: 48px;
    }
`;

const StyledInfoIcon = styled(InfoIcon)`
    margin-left: 10px;

    path {
        fill: ${({ theme }) => {
            switch (theme.theme) {
                case Theme.Light:
                    return '#111928';
                default:
                    '#fff';
            }
        }};
    }
`;
