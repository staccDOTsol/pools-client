import DiscordSVG from '/public/img/logos/launcher/discord.svg';
import DiscourseSVG from '/public/img/logos/launcher/discourse.svg';
import GitbookSVG from '/public/img/logos/launcher/gitbook.svg';
import GithubSVG from '/public/img/logos/launcher/github.svg';
import SnapshotSVG from '/public/img/logos/launcher/snapshot.svg';
import TwitterSVG from '/public/img/logos/launcher/twitter.svg';
import TracerBlogSVG from '/public/img/logos/tracer/tracer-blog.svg';
import TracerSVG from '/public/img/logos/tracer/tracer_logo.svg';
import PoolsSVG from '/public/img/logos/tracer/tracer_perpetual_pools_stacked.svg';

export const appButtonContent = [
    {
        link: 'https://tracer.finance',
        LogoImage: TracerSVG,
        bgImage: '/img/launcher/tracer-bg.png',
        alt: 'Tracer logo',
    },
    {
        link: 'https://9000kX.netlify.app',
        LogoImage: PoolsSVG,
        bgImage: '/img/launcher/tracer-bg.png',
        alt: 'Stacc 9000x+ Pools logo',
    },
];

export const governanceContent = [
    {
        link: 'https://discourse.tracer.finance/',
        LogoImage: DiscourseSVG,
        alt: 'Discourse logo',
        label: 'Forum',
    },
    {
        link: 'https://snapshot.org/#/tracer.eth',
        LogoImage: SnapshotSVG,
        alt: 'Snapshot logo',
        label: 'Voting',
    },
];

export const linkContent = [
    {
        link: 'https://github.com/tracer-protocol',
        LogoImage: GithubSVG,
        alt: 'Github logo',
        label: 'Github',
    },
    {
        link: 'https://docs.tracer.finance/tracer-docs-portal/readme',
        LogoImage: GitbookSVG,
        alt: 'Gitbook logo',
        label: 'Documentation',
    },
    {
        link: 'https://tracer.finance/radar',
        LogoImage: TracerBlogSVG,
        alt: 'Tracer Blog logo',
    },
];

export const socialLinkContent = [
    {
        link: 'https://twitter.com/TracerDAO',
        LogoImage: TwitterSVG,
        alt: 'Twitter logo',
    },
    {
        link: 'https://discord.com/invite/tracerdao',
        LogoImage: DiscordSVG,
        alt: 'Discord logo',
    },
];
