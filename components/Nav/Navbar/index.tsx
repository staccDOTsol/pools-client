import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ThemeSwitcher from './ThemeSwitcher';
// @ts-ignore
import ENS, { getEnsAddress } from '@ensdomains/ensjs';
import HeaderSiteSwitcher from './HeaderSiteSwitcher';
import { useWeb3, useWeb3Actions } from '@context/Web3Context/Web3Context';
import AccountDropdown from './AccountDropdown';
import { Select, SelectOption } from '@components/General/Input';
import { Logo } from '@components/General';
import { ARBITRUM } from '@libs/constants';

const NavBar: React.FC = styled(({ className }) => {
    return (
        <div className={className}>
            <NavBarContent />
        </div>
    );
})`
    background-image: url('/img/nav-bg.png');
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
`;

export const NavBarContent = styled(({ className }) => {
    const routes = useRouter().asPath.split('/');
    const route = routes[1];
    const { account, network, ethBalance } = useWeb3();

    const { onboard, resetOnboard, handleConnect } = useWeb3Actions();

    const ensName = useEnsName(account ?? '');

    const linkStyles = 'mx-2 py-2';

    return (
        <nav className={`${className} container`}>
            <HeaderSiteSwitcher />
            <Links>
                <li className={linkStyles + (route === '' ? ' selected' : '')}>
                    <Link href="/">
                        <a className="m-auto">Trade</a>
                    </Link>
                </li>
                <li className={linkStyles + (route === 'strategise' ? ' selected' : '')}>
                    <Link href="/">
                        <a className="m-auto">Strategise</a>
                    </Link>
                </li>
                <li className={linkStyles + (route === 'portfolio' ? ' selected' : '')}>
                    <Link href="/">
                        <a className="m-auto">Portfolio</a>
                    </Link>
                </li>
                {/* <li className={linkStyles + (route === 'browse' ? ' selected' : '')}>
                    <Link href="/browse">
                        <a className="m-auto">Browse</a>
                    </Link>
                </li> */}
            </Links>

			<NetworkDropdown preview={<NetworkPreview networkID={ARBITRUM} networkName={'Arbitrum'} />}>
				<SelectOption>Arbitrum</SelectOption>
			</NetworkDropdown>

            <AccountDropdown
                onboard={onboard}
                account={account}
                ensName={ensName}
                network={network ?? 0}
                tokenBalance={ethBalance ?? 0}
                logout={resetOnboard}
                handleConnect={handleConnect}
            />

            <ThemeSwitcher />

            {/** TODO this will need to change to Arbritrum network id */}
            {/* {process.env.NEXT_PUBLIC_DEPLOYMENT !== 'DEVELOPMENT' ? (
                <UnknownNetwork display={network !== 421611 && !!network} />
            ) : null} */}
        </nav>
    );
})`
    display: flex;
    color: var(--color-text);
    height: 60px;

    background-image: url('/img/nav-bg.png');
    background-repeat: no-repeat;
    background-size: cover;


`;

export default NavBar;

// const switchNetworks = async () => {
//     // @ts-ignore
//     const ethereum = window.ethereum;
//     try {
//         await ethereum.request({
//             method: 'wallet_switchEthereumChain',
//             params: [{ chainId: '0x66EEB' }], //arbitrum
//         });
//     } catch (error) {
//         // This error code indicates that the chain has not been added to MetaMask.
//         if (error.code === 4902) {
//             try {
//                 await ethereum.request({
//                     method: 'wallet_addEthereumChain',
//                     params: [{ chainId: '0x66EEB', rpcUrl: 'https://rinkeby.arbitrum.io/rpc' }],
//                 });
//             } catch (addError) {
//                 // handle "add" error
//             }
//         }
//         // handle other "switch" errors
//     }
// };

// const NetworkButton = styled.span`
//     border: 1px solid #fff;
//     transition: 0.3s;
//     border-radius: 20px;
//     padding: 0 10px;
//     &:hover {
//         cursor: pointer;
//         background: #fff;
//         color: #f15025;
//     }
// `;

// type UNProps = {
//     display: boolean;
//     className?: string;
// };
// const UnknownNetwork: React.FC<UNProps> = styled(({ className }: UNProps) => {
//     // TODO add an onclick to swap to arbritrum using
//     // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
//     return (
//         <div className={className}>
//             You are connected to the wrong network. Switch to{' '}
//             <NetworkButton onClick={() => switchNetworks()}>Arbitrum Testnet.</NetworkButton>
//         </div>
//     );
// })`
//     background: #f15025;
//     color: var(--color-text);
//     letter-spacing: -0.36px;
//     height: 40px;
//     line-height: 40px;
//     font-size: var(--font-size-medium);
//     width: 100%;
//     position: absolute;
//     left: 0;
//     text-align: center;
//     bottom: ${(props) => (props.display ? '-40px' : '0px')};
//     opacity: ${(props) => (props.display ? '1' : '0')};
//     z-index: ${(props) => (props.display ? '2' : '-1')};
//     transition: ${(props) =>
//         props.display ? 'bottom 0.3s, opacity 0.3s 0.1s' : 'bottom 0.3s 0.15s, opacity 0.3s, z-index 0.3s 0.3s'};
// `;

const NetworkDropdown = styled(Select)`
	border: 1px solid #FFFFFF;
	box-sizing: border-box;
	border-radius: 7px;
	background: transparent;
	margin: auto 1rem;
	width: 158px;
	height: 42px;

	& svg {
		fill: #fff;
	}
`

const Links = styled.ul`
	display: flex;
	margin-right: auto;
	margin-left: 1rem;
	color: #fff;
	margin-bottom: 0;
	font-size: 14px;

    & li {
        display: flex;
        transition: 0.2s;
        padding: 0 20px;
    }

    & li.selected {
        // color: #37b1f6;
		text-decoration: underline;
    }

    & li:hover {
        color: #37b1f6;
    }

    & li .trade-toggle {
        display: none;
    }

    & li.selected .trade-toggle {
        display: flex;
        margin: auto 20px;
        border: 1px solid var(--color-primary);
        border-radius: 20px;
    }

    & li.selected .trade-toggle div {
        width: 100px;
        text-align: center;
        transition: 0.2s;

        &:hover {
            cursor: pointer;
        }
    }

    & li.selected .trade-toggle div.selected {
        color: var(--color-background);
        background-color: var(--color-primary);
        border-radius: 20px;
    }


`

const NetworkPreview = styled(({ networkID, networkName, className }) => {
	return (
		<div className={className}>
			<Logo ticker={networkID} />
			{networkName}
		</div>
	)
})`
	color: #fff;
	display: flex;
	margin: 0.25rem;
	line-height: 2rem;
	padding: 0 0.5rem;
	${Logo} {
		display: inline;
		vertical-align: 0;
		width: 20px;
		height: 22px;
		margin-right: 0.5rem;
	}
`

const useEnsName = (account: string) => {
    const [ensName, setEnsName] = useState(account);
    const [ens, setEns] = useState(undefined);
    const { provider } = useWeb3();

    useEffect(() => {
        if (provider) {
            const ens = new ENS({ provider, ensAddress: getEnsAddress('1') });
            setEns(ens);
        }
    }, [provider]);

    useEffect(() => {
        if (!!ens && !!account) {
            const getEns = async () => {
                try {
                    const name = await (ens as ENS).getName(account);
                    if (name.name) {
                        setEnsName(name.name);
                    }
                } catch (err) {
                    console.error('Failed to fetch ens name', err);
                }
            };
            getEns();
        }
    }, [ens, account]);

    return ensName;
};
